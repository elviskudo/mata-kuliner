import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ShiftStatus {
    OPEN = 'Open',
    CLOSED = 'Closed'
}

@Entity()
export class ShiftSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cashierName: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    startingCash: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    endingCash: number;

    @Column({
        type: 'enum',
        enum: ShiftStatus,
        default: ShiftStatus.OPEN
    })
    status: ShiftStatus;

    @CreateDateColumn()
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
