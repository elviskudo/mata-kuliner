import { Injectable, BadRequestException } from '@nestjs/common';

// Helper: tanggal hari ini dalam WIB (UTC+7) format YYYY-MM-DD
function getTodayWIB(): string {
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().split('T')[0];
}
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { DailyClosing } from './daily-closing.entity';
import { WasteLog, WasteAction, WasteType } from './waste-log.entity';
import { Menu } from './menu.entity';
import { Transaction } from './transaction.entity';
import { StoreSetting } from './store-setting.entity';
import { MenuSnapshot } from './menu-snapshot.entity';
import { MenuIngredient } from './menu-ingredient.entity';

@Injectable()
export class OperationalService {

    constructor(
        @InjectRepository(DailyClosing)
        private dailyClosingRepo: Repository<DailyClosing>,
        @InjectRepository(WasteLog)
        private wasteLogRepo: Repository<WasteLog>,
        @InjectRepository(Menu)
        private menuRepo: Repository<Menu>,
        @InjectRepository(Transaction)
        private transactionRepo: Repository<Transaction>,
        @InjectRepository(StoreSetting)
        private storeSettingRepo: Repository<StoreSetting>,
        private dataSource: DataSource,
    ) { }

    async getStoreStatus() {
        const setting = await this.storeSettingRepo.findOne({ where: { key: 'IS_STORE_OPEN' } });

        if (setting) {
            return { isOpen: setting.value === 'true' };
        }

        // Fallback: Auto-Close Logic (22:00 - 07:00 WIB)
        // Note: Server time might be UTC or Local. We assume need adjustment if UTC, or direct if Local.
        // Safer to check offset. Indonesia is UTC+7.
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const wib = new Date(utc + (7 * 3600000));
        const hour = wib.getHours();

        const isClosedHours = hour >= 22 || hour < 7;
        return { isOpen: !isClosedHours };
    }

    async updateStoreStatus(isOpen: boolean) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Update Store Setting
            let setting = await this.storeSettingRepo.findOne({ where: { key: 'IS_STORE_OPEN' } });
            if (!setting) {
                setting = this.storeSettingRepo.create({ key: 'IS_STORE_OPEN' });
            }
            setting.value = String(isOpen);
            await queryRunner.manager.save(setting);

            if (!isOpen) {
                // CLOSING STORE LOGIC: Snapshot & Delete Menus
                // Fetch all current menus using the transaction manager
                const menus = await queryRunner.manager.find(Menu);

                if (menus.length > 0) {
                    const today = getTodayWIB();

                    // Create Snapshots
                    const snapshots = menus.map(m => this.dataSource.getRepository(MenuSnapshot).create({
                        originalMenuId: m.id,
                        name: m.name,
                        price: m.price,
                        stock: m.stock,
                        image: m.image,
                        closingDate: today
                    }));

                    await queryRunner.manager.save(snapshots);

                    // DELETE ALL MENUS (and ingredients via cascade/logic)
                    // Note: Menu ingredients usually have ON DELETE CASCADE or need manual deletion.
                    // Assuming TypeORM Cascade or manual delete. Checking Menu Entity...
                    // Safest is to delete ingredients first if not cascaded.
                    // But Menu -> MenuIngredient usually is cascaded or we delete by ID.
                    // Let's use delete() on repo which might respect cascade if configured, 
                    // or improved: delete ingredients manually first.

                    // We need to delete menu ingredients first
                    await queryRunner.manager.createQueryBuilder().delete().from(MenuIngredient).execute();
                    // Then delete menus
                    await queryRunner.manager.createQueryBuilder().delete().from(Menu).execute();
                }
            }

            await queryRunner.commitTransaction();
            return setting;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getClosingSummary(date: string) {
        // Calculate start and end of the day in WIB (UTC+7)
        // e.g. "2026-02-23" WIB = 2026-02-22T17:00:00Z to 2026-02-23T16:59:59.999Z
        const startOfDay = new Date(`${date}T00:00:00+07:00`);
        const endOfDay = new Date(`${date}T23:59:59.999+07:00`);

        // Fetch Transactions with relation to items if needed, but items is json column so fine.
        const transactions = await this.transactionRepo.find({
            where: {
                createdAt: Between(startOfDay, endOfDay),
            },
            order: { createdAt: 'DESC' }
        });

        const totalSales = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const totalTransactions = transactions.length;

        // Fetch Waste/Returns
        const wasteLogs = await this.wasteLogRepo.find({
            where: {
                createdAt: Between(startOfDay, endOfDay),
            },
            order: { createdAt: 'DESC' }
        });

        // Hourly Breakdown Analysis
        const hourlySales: Record<string, { count: number, total: number, details: any[] }> = {};
        const hourlyReturns: Record<string, { count: number, items: string[], details: any[] }> = {};

        // Initialize 24 hours
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0') + ":00";
            hourlySales[hour] = { count: 0, total: 0, details: [] };
            hourlyReturns[hour] = { count: 0, items: [], details: [] };
        }

        // Process Transactions
        transactions.forEach(t => {
            // Convert to WIB (+7)
            const wibDate = new Date(t.createdAt.getTime() + 7 * 60 * 60 * 1000);
            const hour = wibDate.getUTCHours().toString().padStart(2, '0') + ":00";
            const timeString = `${wibDate.getUTCHours().toString().padStart(2, '0')}:${wibDate.getUTCMinutes().toString().padStart(2, '0')}`;

            if (hourlySales[hour]) {
                hourlySales[hour].count++;
                hourlySales[hour].total += Number(t.amount || 0);
                hourlySales[hour].details.push({
                    id: t.id,
                    time: timeString,
                    amount: Number(t.amount),
                    items: t.items,
                    customer: t.cashierName || 'Guest' // Fallback
                });
            }
        });

        // Process Waste/Returns (Specifically RETURNED items)
        wasteLogs.forEach(w => {
            if (w.action === WasteAction.RETURNED) {
                const wibDate = new Date(w.createdAt.getTime() + 7 * 60 * 60 * 1000);
                const hour = wibDate.getUTCHours().toString().padStart(2, '0') + ":00";
                const timeString = `${wibDate.getUTCHours().toString().padStart(2, '0')}:${wibDate.getUTCMinutes().toString().padStart(2, '0')}`;

                if (hourlyReturns[hour]) {
                    hourlyReturns[hour].count++;
                    hourlyReturns[hour].items.push(w.itemName);
                    hourlyReturns[hour].details.push({
                        id: w.id,
                        time: timeString,
                        item: w.itemName,
                        reason: w.reason,
                        qty: w.quantity
                    });
                }
            }
        });

        // Get existing closing data if any
        const closingData = await this.dailyClosingRepo.findOne({
            where: { date },
        });

        // Build waste log details (all types, with formatted WIB time)
        const wasteLogDetails = wasteLogs.map(w => {
            const wibDate = new Date(w.createdAt.getTime() + 7 * 60 * 60 * 1000);
            return {
                id: w.id,
                itemName: w.itemName,
                quantity: Number(w.quantity),
                action: w.action,
                reason: w.reason,
                type: w.type,
                time: `${wibDate.getUTCHours().toString().padStart(2, '0')}:${wibDate.getUTCMinutes().toString().padStart(2, '0')}`,
                createdAt: w.createdAt,
            };
        });

        // Total return/discard metrics from waste logs
        const discardedLogs = wasteLogs.filter(w => w.action === WasteAction.DISCARDED);
        const storedLogs = wasteLogs.filter(w => w.action === WasteAction.STORED);
        // Only actual TIDAK LAYAK items count as discarded
        const tidakLayakLogs = discardedLogs.filter(w => w.reason?.startsWith('[TIDAK LAYAK]'));
        // Layak tapi disalurkan: reason [LAYAK] + bukan Masuk Kulkas
        // Tangkap dari dua sumber supaya data lama (yang mungkin salah tersimpan sebagai STORED) juga benar
        const layakDisalurkanLogs = wasteLogs.filter(w =>
            w.reason?.startsWith('[LAYAK]') && !w.reason?.includes('Masuk Kulkas')
        );
        // Stock benar-benar disimpan di kulkas = STORED + reason mengandung "Masuk Kulkas"
        const trulyStoredLogs = wasteLogs.filter(w =>
            w.action === WasteAction.STORED && w.reason?.includes('Masuk Kulkas')
        );
        const totalDiscardedQty = tidakLayakLogs.reduce((sum, w) => sum + Number(w.quantity), 0);
        const totalStoredQty = trulyStoredLogs.reduce((sum, w) => sum + Number(w.quantity), 0);
        const totalLayakDisalurkanQty = layakDisalurkanLogs.reduce((sum, w) => sum + Number(w.quantity), 0);

        return {
            date,
            totalSales,
            totalTransactions,
            // Return & waste metrics
            totalDiscardedQty,
            totalStoredQty,
            totalLayakDisalurkanQty,
            totalWasteValue: closingData?.totalWasteValue ?? 0,
            wasteLogDetails,
            // Hourly analysis
            hourlyAnalysis: {
                sales: hourlySales,
                returns: hourlyReturns
            },
            isClosed: !!closingData,
            closingData,
            // Closing time (jam submit laporan) in WIB
            closedAt: closingData?.closedAt
                ? (() => {
                    const wib = new Date(new Date(closingData.closedAt).getTime() + 7 * 60 * 60 * 1000);
                    return `${wib.getUTCHours().toString().padStart(2, '0')}:${wib.getUTCMinutes().toString().padStart(2, '0')} WIB`;
                })()
                : null,
        };
    }

    async deleteClosing(date: string) {
        if (!date) throw new BadRequestException('Date is required');

        // Delete daily closing record
        await this.dailyClosingRepo.delete({ date });

        // Optionally, we could clean up waste logs or snapshots, but usually safer to keep them 
        // or let user overwrite them. 
        // Snapshots are unique by (originalMenuId, closingDate), so re-closing will overwrite or fail.
        // Let's delete snapshots for this date to allow clean re-close.

        await this.dataSource.getRepository(MenuSnapshot).delete({ closingDate: date });

        return { success: true };
    }

    async closeDay(dto: {
        date: string;
        cashierName: string;
        notes?: string;
        wasteLogs: {
            itemId: number;
            type: WasteType;
            quantity: number;
            action: WasteAction;
            reason: string;
        }[];
    }) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Calculate totals again to be safe
            const summary = await this.getClosingSummary(dto.date);

            // 2. Create DailyClosing record
            const closing = this.dailyClosingRepo.create({
                date: dto.date,
                totalSales: summary.totalSales,
                totalTransactions: summary.totalTransactions,
                cashierName: dto.cashierName,
                notes: dto.notes,
                totalWasteValue: 0, // Pending calculation if needed
            });
            await queryRunner.manager.save(closing);

            // 2.1 CHECK FOR ACTIVE MENUS (Auto-Close Scenario Repair)
            // If menus still exist in the main table, we must SNAPSHOT and DELETE them now.
            const activeMenus = await queryRunner.manager.find(Menu);
            if (activeMenus.length > 0) {
                const today = getTodayWIB(); // Use current WIB date for snapshot
                const snapshots = activeMenus.map(m => this.dataSource.getRepository(MenuSnapshot).create({
                    originalMenuId: m.id,
                    name: m.name,
                    price: m.price,
                    stock: m.stock,
                    image: m.image,
                    closingDate: today
                }));
                await queryRunner.manager.save(snapshots);

                // Delete Menus (Ingredients cascade usually, but manual delete to be safe/explicit if needed)
                await queryRunner.manager.createQueryBuilder().delete().from(MenuIngredient).execute();
                await queryRunner.manager.createQueryBuilder().delete().from(Menu).execute();
            }

            // 3. Process Waste Logs & Stock Updates
            let totalWasteValue = 0;

            for (const log of dto.wasteLogs) {
                if (!log.reason) {
                    throw new BadRequestException(`Reason is mandatory for item ${log.itemId} with action ${log.action}`);
                }

                // Create Waste Log
                let itemName = 'Unknown';
                let menuExists = false;
                let menuPrice = 0;

                // Try finding in active menu (unlikely if store closed via new flow)
                let menu = await this.menuRepo.findOneBy({ id: log.itemId });

                if (menu) {
                    itemName = menu.name;
                    menuPrice = Number(menu.price);
                    menuExists = true;
                } else {
                    // Try finding in snapshot
                    const snapshot = await this.dataSource.getRepository(MenuSnapshot).findOne({
                        where: { originalMenuId: log.itemId, closingDate: dto.date }
                    });
                    if (snapshot) {
                        itemName = snapshot.name;
                        menuPrice = Number(snapshot.price);
                    }
                }

                // Calculate kerugian for DISCARDED items
                if (log.action === WasteAction.DISCARDED) {
                    totalWasteValue += Number(log.quantity) * menuPrice;
                }

                // STOCK UPDATE LOGIC
                if (log.action === WasteAction.STORED && menuExists) {
                    await queryRunner.manager.update(Menu, log.itemId, { stock: log.quantity });
                }

                const waste = this.wasteLogRepo.create({
                    ...log,
                    itemName,
                    resolved: true,
                });
                await queryRunner.manager.save(waste);
            }

            // Update totalWasteValue on the closing record
            closing.totalWasteValue = totalWasteValue;
            await queryRunner.manager.save(closing);

            await queryRunner.commitTransaction();
            return closing;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async registerComplaint(dto: {
        itemId: number;
        reason: string;
        replace: boolean; // True = Give new item (reduce stock), False = Just log (Refund needs refund logic, simplified here)
        createdAt?: string;
    }) {
        if (!dto.reason) throw new BadRequestException("Reason is required for complaints");

        const menu = await this.menuRepo.findOneBy({ id: dto.itemId });
        if (!menu) throw new BadRequestException("Menu not found");

        // Log waste
        const waste = this.wasteLogRepo.create({
            type: WasteType.MENU,
            itemId: dto.itemId,
            itemName: menu.name,
            quantity: 1,
            action: WasteAction.RETURNED,
            reason: dto.reason,
            resolved: true
        });

        if (dto.createdAt) {
            waste.createdAt = new Date(dto.createdAt);
        }

        await this.wasteLogRepo.save(waste);

        if (dto.replace) {
            // Deduct stock for the replacement item
            await this.menuRepo.decrement({ id: dto.itemId }, 'stock', 1);
        }

        return waste;
    }

    async getWasteReport(startDate: string, endDate: string) {
        return this.wasteLogRepo.find({
            where: {
                createdAt: Between(
                    new Date(`${startDate}T00:00:00+07:00`),
                    new Date(`${endDate}T23:59:59.999+07:00`)
                )
            },
            order: { createdAt: 'DESC' }
        });
    }

    async getHourlyTransactions(date: string, hour: string) {
        if (!date || !hour) return [];

        const start = new Date(`${date}T${hour}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

        // Ensure we match the hour precisely based on POS creation time
        return this.transactionRepo.find({
            where: {
                createdAt: Between(start, end)
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getClosingMenus(date?: string) {
        let closingDate = date;

        if (!closingDate) {
            const latestSnapshot = await this.dataSource.getRepository(MenuSnapshot).findOne({
                order: { id: 'DESC' },
                select: ['closingDate'] // Only fetch the date
            });

            if (latestSnapshot) {
                closingDate = latestSnapshot.closingDate;
            } else {
                return [];
            }
        }

        return this.dataSource.getRepository(MenuSnapshot).find({
            where: { closingDate: closingDate }
        });
    }

    async getAllSnapshots() {
        return this.dataSource.getRepository(MenuSnapshot).find({
            select: ['id', 'name', 'closingDate', 'originalMenuId'],
            order: { id: 'DESC' },
            take: 50
        });
    }

    async getClosingsByDateRange(from: string, to: string) {
        return this.dailyClosingRepo.find({
            where: {
                date: Between(from as any, to as any)
            },
            order: { date: 'DESC' }
        });
    }
}
