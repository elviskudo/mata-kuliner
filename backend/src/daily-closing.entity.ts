import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'owner', name: 'daily_closing' })
export class DailyClosing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @CreateDateColumn()
    closedAt: Date;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    totalSales: number;

    @Column('int', { default: 0 })
    totalTransactions: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    totalWasteValue: number;

    @Column({ nullable: true })
    cashierName: string;

    @Column('text', { nullable: true })
    notes: string;
}
