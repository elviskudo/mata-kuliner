import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table, TableStatus } from './table.entity';

@Injectable()
export class TablesService {
    constructor(
        @InjectRepository(Table)
        private tablesRepository: Repository<Table>,
    ) { }

    findAll(): Promise<Table[]> {
        return this.tablesRepository.find({ order: { tableNumber: 'ASC' } });
    }

    findOne(id: number): Promise<Table | null> {
        return this.tablesRepository.findOneBy({ id });
    }

    async create(tableData: Partial<Table>): Promise<Table> {
        const newTable = this.tablesRepository.create(tableData);
        return this.tablesRepository.save(newTable);
    }

    async updateStatus(id: number, status: TableStatus): Promise<Table> {
        const table = await this.findOne(id);
        if (!table) {
            throw new NotFoundException(`Table with ID ${id} not found`);
        }
        table.status = status;
        return this.tablesRepository.save(table);
    }

    async remove(id: number): Promise<void> {
        await this.tablesRepository.delete(id);
    }
}
