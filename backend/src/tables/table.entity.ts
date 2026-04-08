import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TableStatus {
    EMPTY = 'Empty',
    OCCUPIED = 'Occupied',
    RESERVED = 'Reserved'
}

@Entity()
export class Table {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    tableNumber: string;

    @Column({ type: 'int', default: 4 })
    capacity: number;

    @Column({
        type: 'enum',
        enum: TableStatus,
        default: TableStatus.EMPTY
    })
    status: TableStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
