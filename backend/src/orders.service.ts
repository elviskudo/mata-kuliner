import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Order } from './order.entity';
import { Menu } from './menu.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Menu)
        private menuRepository: Repository<Menu>,
    ) { }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Order | null> {
        return this.ordersRepository.findOne({ where: { id } });
    }

    async create(orderData: Partial<Order> & { createdAt?: string }): Promise<Order> {
        const order = this.ordersRepository.create(orderData);

        if (orderData.createdAt) {
            order.createdAt = new Date(orderData.createdAt);
        }

        const savedOrder = await this.ordersRepository.save(order);

        // Automatically deduct stock for each item in the order
        if (savedOrder.items && Array.isArray(savedOrder.items)) {
            for (const item of savedOrder.items) {
                const menuId = parseInt(item.id);
                const quantity = item.qty || 1;

                if (!isNaN(menuId)) {
                    try {
                        // Use query to atomically cap stock at 0 (no negative stock)
                        await this.menuRepository
                            .createQueryBuilder()
                            .update()
                            .set({
                                stock: () => `GREATEST(0, stock - ${quantity})`
                            })
                            .where('id = :id', { id: menuId })
                            .execute();
                    } catch (error) {
                        console.error(`Failed to decrement stock for menu item ${menuId}:`, error);
                    }
                }
            }
        }

        return savedOrder;
    }

    async updateStatus(id: number, status: string): Promise<Order | null> {
        await this.ordersRepository.update(id, { status });
        return this.findOne(id);
    }

    /**
     * Check if any kitchen-managed order (Dine In / Take away) has a pending status.
     * This mirrors the filter used in the kitchen orders page.
     */
    async hasPendingOrders(): Promise<boolean> {
        const pendingStatuses = ['COMPLETED', 'Done', 'DONE', 'completed'];
        const kitchenTypes = ['Dine In', 'Take away'];

        const orders = await this.ordersRepository.find({
            where: kitchenTypes.map(orderType => ({ orderType })),
        });

        const hasPending = orders.some(o => !pendingStatuses.includes(o.status));
        return hasPending;
    }

    /**
     * Delete all orders. Called after successfully closing the store.
     */
    async deleteAllOrders(): Promise<{ deleted: number }> {
        const result = await this.ordersRepository.createQueryBuilder()
            .delete()
            .from(Order)
            .execute();
        return { deleted: result.affected || 0 };
    }
}
