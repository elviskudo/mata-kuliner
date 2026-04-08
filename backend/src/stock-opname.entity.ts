import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum OpnameStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity({ schema: 'owner', name: 'stock_opnames' })
export class StockOpname {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    itemId: number; // ID of the Product (Ingredient)

    @Column()
    itemName: string;

    @Column('decimal', { precision: 10, scale: 2 })
    systemStock: number; // Stock in the database at the time of report

    @Column('decimal', { precision: 10, scale: 2 })
    physicalStock: number; // Actual physical stock reported

    @Column('decimal', { precision: 10, scale: 2 })
    difference: number; // Physical - System

    @Column('text')
    notes: string;

    @Column({
        type: 'enum',
        enum: OpnameStatus,
        default: OpnameStatus.PENDING
    })
    status: OpnameStatus;

    @Column()
    reportedBy: string; // Employee Name/Role who reported it

    @CreateDateColumn()
    createdAt: Date;
}
