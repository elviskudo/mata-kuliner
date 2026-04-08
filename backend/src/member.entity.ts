import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity({ schema: 'public' }) // Using public schema for shared access if needed, or keeping consistent with others
export class Member {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ default: 'Active' })
    status: string; // Active, Inactive

    @CreateDateColumn()
    joinDate: Date;

    @UpdateDateColumn()
    lastVisit: Date;

    @Column('decimal', { default: 0, precision: 15, scale: 2 })
    totalSpent: number;

    @Column({ default: 0 })
    points: number;

    @OneToMany(() => Transaction, (transaction) => transaction.member)
    transactions: Transaction[];
}
