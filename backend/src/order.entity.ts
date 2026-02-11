import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'kitchen' })
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customerName: string;

    @Column('decimal')
    totalAmount: number;

    @Column({ default: 'pending' })
    status: string;

    @Column('json', { nullable: true })
    items: any[];

    @Column({ length: 20, nullable: true })
    orderType: string; // 'Take away' or 'Here'

    @Column({ length: 20, nullable: true })
    paymentMethod: string; // 'Cash' or 'QRIS'

    @CreateDateColumn()
    createdAt: Date;
}
