import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'pos', name: 'transactions' })
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 20 })
    paymentMethod: string; // 'Cash' or 'QRIS'

    @Column({ length: 20 })
    orderType: string; // 'Take away' or 'Here'

    @Column('json')
    items: any[];

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;

    @Column('decimal', { precision: 10, scale: 2 })
    tax: number;

    @Column({ length: 100, nullable: true })
    cashierName: string;

    @CreateDateColumn()
    createdAt: Date;
}
