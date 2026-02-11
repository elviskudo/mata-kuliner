import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
    ) { }

    async create(transactionData: Partial<Transaction>): Promise<Transaction> {
        const transaction = this.transactionsRepository.create(transactionData);
        return this.transactionsRepository.save(transaction);
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
        });
    }
}
