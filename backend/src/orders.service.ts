import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
    ) { }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Order> {
        return this.ordersRepository.findOne({ where: { id } });
    }

    async create(orderData: any): Promise<Order> {
        const order = this.ordersRepository.create(orderData);
        return this.ordersRepository.save(order);
    }

    async updateStatus(id: number, status: string): Promise<Order> {
        await this.ordersRepository.update(id, { status });
        return this.findOne(id);
    }
}
