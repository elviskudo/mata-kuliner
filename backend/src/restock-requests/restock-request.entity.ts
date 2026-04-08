import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RestockRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Entity()
export class RestockRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    items: { name: string; qty: number; unit: string; estimatedPrice: number }[];

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalEstimatedPrice: number;

    @Column({
        type: 'enum',
        enum: RestockRequestStatus,
        default: RestockRequestStatus.PENDING,
    })
    status: RestockRequestStatus;

    @Column({ nullable: true })
    requestedBy: string;

    @Column({ nullable: true })
    approvedBy: string;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
