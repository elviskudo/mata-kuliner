import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './transaction.entity';
import { DailyClosing } from './daily-closing.entity';
import { Order } from './order.entity';
import { Menu } from './menu.entity';
import { Table, TableStatus } from './tables/table.entity';
import { Member } from './member.entity';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(DailyClosing)
        private dailyClosingRepository: Repository<DailyClosing>,
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Menu)
        private menuRepository: Repository<Menu>,
        private dataSource: DataSource,
        private whatsappService: WhatsappService,
    ) { }

    async create(transactionData: Partial<Transaction> & { createdAt?: string }): Promise<Transaction> {
        // ... (Keep existing create for legacy/other uses if needed, or deprecate)
        const today = new Date().toISOString().split('T')[0];
        const isClosed = await this.dailyClosingRepository.findOne({ where: { date: today } });

        if (isClosed) {
            throw new BadRequestException('Cannot create transaction: Day is already closed.');
        }

        const transaction = this.transactionsRepository.create(transactionData);

        if (transactionData.createdAt) {
            transaction.createdAt = new Date(transactionData.createdAt);
        }

        if (transactionData.memberId) {
            transaction.member = { id: transactionData.memberId } as any;
        }

        return this.transactionsRepository.save(transaction);
    }

    async checkout(checkoutData: any): Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Check if store is closed
            const today = new Date().toISOString().split('T')[0];
            const isClosed = await queryRunner.manager.findOne(DailyClosing, { where: { date: today } });
            if (isClosed) {
                throw new BadRequestException('Store is already closed for today.');
            }

            const { items, paymentMethod, orderType, cashierName, memberId, createdAt } = checkoutData;

            if (!items || !items.length) {
                throw new BadRequestException('Cart is empty.');
            }

            const isPoints = paymentMethod === 'Points';
            if (isPoints && !memberId) {
                throw new BadRequestException('Pembayaran Poin membutuhkan Member yang valid.');
            }

            let calculatedSubtotal = 0;
            let calculatedTotalPointsCost = 0;
            const orderItems: any[] = [];

            // 2. Validate stock and calculate true price / point cost
            for (const item of items) {
                const qty = item.qty || 1;
                const menuId = parseInt(item.id);

                // Fetch real menu price and stock from DB
                const menu = await queryRunner.manager.findOne(Menu, { where: { id: menuId } });
                if (!menu) {
                    throw new BadRequestException(`Menu item not found: ${item.name}`);
                }

                if (menu.stock < qty) {
                    throw new BadRequestException(`Insufficient stock for ${menu.name}. Available: ${menu.stock}`);
                }

                // Calculate cost in points per item
                let itemPointCost = 0;
                if (menu.price < 10000) itemPointCost = 3;
                else if (menu.price == 10000) itemPointCost = 5;
                else itemPointCost = 7;

                calculatedTotalPointsCost += (itemPointCost * qty);
                calculatedSubtotal += (menu.price * qty);

                orderItems.push({
                    id: menu.id.toString(),
                    name: menu.name,
                    price: menu.price,
                    pointCost: itemPointCost,
                    image: menu.image,
                    qty: qty
                });
            }

            // 3. Tax and Total calculation
            const calculatedTax = Math.round(calculatedSubtotal * 0.11);
            const calculatedTotal = calculatedSubtotal + calculatedTax; // Rupiah equivalent (for orders)

            // 4. Determine status based on payment method
            const isQris = paymentMethod === 'QRIS';
            const initialStatus = isQris ? 'Pending Payment' : 'Completed';
            const orderStatus = isQris ? 'Pending Payment' : 'pending'; // For kitchen

            // 5. Create Transaction
            const transactionRecord = this.transactionsRepository.create({
                amount: calculatedTotal,
                paymentMethod,
                orderType,
                items: orderItems,
                subtotal: calculatedSubtotal,
                tax: calculatedTax,
                cashierName: cashierName || 'Cashier',
                memberId: memberId || null,
                createdAt: createdAt ? new Date(createdAt) : new Date(),
            });

            const savedTransaction = await queryRunner.manager.save(Transaction, transactionRecord);

            // 6. Create Order for kitchen
            const orderRecord = this.ordersRepository.create({
                customerName: cashierName || 'Cashier',
                totalAmount: calculatedTotal,
                status: orderStatus,
                items: orderItems,
                orderType,
                paymentMethod,
                tableId: checkoutData.tableId || null,
                createdAt: createdAt ? new Date(createdAt) : new Date(),
            });

            const savedOrder = await queryRunner.manager.save(Order, orderRecord);

            // 6.5 Update Table Status if tableId is provided
            if (checkoutData.tableId) {
                const tableToUpdate = await queryRunner.manager.findOne(Table, { where: { id: checkoutData.tableId } });
                if (tableToUpdate) {
                    tableToUpdate.status = TableStatus.OCCUPIED;
                    await queryRunner.manager.save(tableToUpdate);
                }
            }

            // 7. Deduct Stock immediately (even for QRIS, to reserve it. We can add a crontab to return stock if QRIS expires)
            for (const item of orderItems) {
                const qty = item.qty;
                const menuId = parseInt(item.id);
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Menu)
                    .set({ stock: () => `GREATEST(0, stock - ${qty})` })
                    .where('id = :id', { id: menuId })
                    .execute();
            }

            // 8. Update Member totalSpent and points if memberId is provided
            if (memberId) {
                const member = await queryRunner.manager.findOne(Member, { where: { id: memberId } });
                if (member) {
                    if (isPoints) {
                        // Jika bayar pakai Poin
                        if (member.points < calculatedTotalPointsCost) {
                            throw new BadRequestException(`Poin Tidak Cukup! Saldo Member: ${member.points} Poin. Tagihan Ingin Dibayar: ${calculatedTotalPointsCost} Poin.`);
                        }
                        member.points = Number(member.points) - calculatedTotalPointsCost;
                        // Jumlah totalSpent (uang riil dibelanjakan) tidak ditambah saat pakai Poin
                    } else {
                        // Jika bayar pakai Cash/QRIS, dapat Poin Reward 1 poin tiap kelipatan Rp.20.000
                        member.totalSpent = Number(member.totalSpent) + calculatedTotal;
                        member.points = Number(member.points) + Math.floor(calculatedTotal / 20000);
                    }

                    member.lastVisit = new Date();
                    await queryRunner.manager.save(Member, member);

                    // Send WhatsApp Receipt
                    if (member.phone) {
                        const receiptMessage = `*Halo ${member.name}!*\n\nTerima kasih telah berbelanja di Mata Kuliner.\n\n*Detail Transaksi:*\nID Pesanan: ${savedOrder.id}\nTotal: Rp${calculatedTotal.toLocaleString('id-ID')}\nPembayaran: ${paymentMethod}\n\n${isPoints ? `Poin Digunakan: ${calculatedTotalPointsCost}` : `Poin Didapat: ${Math.floor(calculatedTotal / 20000)}`}\nSisa Poin Anda: ${member.points}\n\nSelamat menikmati hidangan kami!`;
                        
                        this.whatsappService.sendMessage(member.phone, receiptMessage).catch(err => {
                            console.error('Failed to send WA receipt message:', err);
                        });
                    }
                }
            }

            await queryRunner.commitTransaction();

            return {
                success: true,
                transaction: savedTransaction,
                order: savedOrder,
                status: initialStatus
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException(error.message || 'Checkout failed.');
        } finally {
            await queryRunner.release();
        }
    }

    async confirmCheckout(orderId: number): Promise<any> {
        // In a real app, this would be a webhook from midtrans/xendit.
        // Here, it's called by the frontend when the cashier confirms payment.
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) throw new BadRequestException('Order not found');

        if (order.status !== 'Pending Payment') {
            throw new BadRequestException('Order is not waiting for payment');
        }

        // Mark as paid
        order.status = 'pending'; // Send to kitchen
        await this.ordersRepository.save(order);

        return { success: true, message: 'Payment confirmed' };
    }

    async findAll(): Promise<Transaction[]> {
        return this.transactionsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async getStats(): Promise<any> {
        const transactions = await this.findAll();

        const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
        const totalCount = transactions.length;

        const cashIncome = transactions
            .filter(t => t.paymentMethod === 'Cash')
            .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

        const qrisIncome = transactions
            .filter(t => t.paymentMethod === 'QRIS')
            .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

        return {
            totalIncome,
            totalCount,
            cashIncome,
            qrisIncome,
            cashCount: transactions.filter(t => t.paymentMethod === 'Cash').length,
            qrisCount: transactions.filter(t => t.paymentMethod === 'QRIS').length,
        };
    }

    async getRecent(limit: number = 10): Promise<Transaction[]> {
        return this.transactionsRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['member']
        });
    }

    async getFinancialReport(startDate: string, endDate: string) {
        const query = this.transactionsRepository.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.member', 'member')
            .where('transaction.createdAt >= :startDate', { startDate })
            .andWhere('transaction.createdAt <= :endDate', { endDate })
            .orderBy('transaction.createdAt', 'DESC');

        const transactions = await query.getMany();

        // Calculate daily stats for graph
        const dailyStats = transactions.reduce((acc, t) => {
            const date = t.createdAt instanceof Date ? t.createdAt.toISOString().split('T')[0] : new Date(t.createdAt).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, count: 0, amount: 0 };
            }
            acc[date].count++;
            acc[date].amount += Number(t.amount);
            return acc;
        }, {});

        return {
            transactions,
            graphData: Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date))
        };
    }
}
