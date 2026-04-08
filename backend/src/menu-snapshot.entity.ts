import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'owner', name: 'menu_snapshot' })
export class MenuSnapshot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    originalMenuId: number;

    @Column()
    name: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    price: number;

    @Column('int', { default: 0 })
    stock: number; // Snapshot of stock at closing

    @Column({ nullable: true })
    image: string;

    @Column({ type: 'date' })
    closingDate: string; // The date this snapshot belongs to

    @CreateDateColumn()
    createdAt: Date;
}
