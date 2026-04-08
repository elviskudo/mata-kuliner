import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockOpname, OpnameStatus } from '../stock-opname.entity';
import { Product } from '../product.entity';

@Injectable()
export class StockOpnameService {
    constructor(
        @InjectRepository(StockOpname)
        private opnameRepo: Repository<StockOpname>,
        private dataSource: DataSource
    ) { }

    async findAll(): Promise<StockOpname[]> {
        return this.opnameRepo.find({ order: { createdAt: 'DESC' } });
    }

    async create(data: Partial<StockOpname>): Promise<StockOpname> {
        // Automatically calculate difference
        if (data.physicalStock !== undefined && data.systemStock !== undefined) {
            data.difference = Number(data.physicalStock) - Number(data.systemStock);
        }
        data.status = OpnameStatus.PENDING;

        const opname = this.opnameRepo.create(data);
        return this.opnameRepo.save(opname);
    }

    async updateStatus(id: number, status: OpnameStatus): Promise<StockOpname> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const opname = await queryRunner.manager.findOne(StockOpname, { where: { id } });
            if (!opname) throw new NotFoundException('Stock Opname record not found');

            if (opname.status !== OpnameStatus.PENDING) {
                throw new BadRequestException('Record is already processed');
            }

            opname.status = status;

            // If approved, adjust the actual product stock
            if (status === OpnameStatus.APPROVED) {
                const product = await queryRunner.manager.findOne(Product, { where: { id: opname.itemId } });
                if (!product) throw new NotFoundException('Related ingredient not found');

                product.stock = opname.physicalStock; // Hard sync the stock
                await queryRunner.manager.save(product);
            }

            const saved = await queryRunner.manager.save(opname);
            await queryRunner.commitTransaction();
            return saved;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
