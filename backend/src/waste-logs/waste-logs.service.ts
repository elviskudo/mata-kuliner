import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WasteLog, WasteType, WasteAction } from '../waste-log.entity';
import { Menu } from '../menu.entity';
import { Product } from '../product.entity';

@Injectable()
export class WasteLogsService {
    constructor(
        @InjectRepository(WasteLog)
        private wasteLogsRepository: Repository<WasteLog>,
        private dataSource: DataSource
    ) { }

    async findAll(): Promise<WasteLog[]> {
        return this.wasteLogsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async createLog(data: Partial<WasteLog>): Promise<WasteLog> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First, deduct the stock based on the type
            if (data.type === WasteType.MENU) {
                const menu = await queryRunner.manager.findOne(Menu, { where: { id: data.itemId } });
                if (!menu) throw new NotFoundException('Menu not found');
                if (menu.stock < (data.quantity || 0)) {
                    throw new BadRequestException('Not enough stock to log as waste');
                }
                menu.stock -= (data.quantity || 0);
                await queryRunner.manager.save(menu);
                // Also capture item name
                data.itemName = menu.name;
            } else if (data.type === WasteType.INGREDIENT) {
                const product = await queryRunner.manager.findOne(Product, { where: { id: data.itemId } });
                if (!product) throw new NotFoundException('Ingredient not found');
                if (product.stock < (data.quantity || 0)) {
                    throw new BadRequestException('Not enough stock to log as waste');
                }
                product.stock -= (data.quantity || 0);
                await queryRunner.manager.save(product);
                // Also capture item name
                data.itemName = product.name;
            }

            // Save the waste log entry
            const logEntry = this.wasteLogsRepository.create(data);
            const savedLog = await queryRunner.manager.save(logEntry);

            await queryRunner.commitTransaction();
            return savedLog;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
