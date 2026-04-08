import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum WasteAction {
    DISCARDED = 'DISCARDED', // Dibuang (Basi, Jatuh, dll)
    STORED = 'STORED',       // Disimpan (Carry Over)
    RETURNED = 'RETURNED',   // Dikembalikan Pelanggan (Komplain)
}

export enum WasteType {
    MENU = 'MENU',
    INGREDIENT = 'INGREDIENT',
}

@Entity({ schema: 'owner', name: 'waste_logs' })
export class WasteLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: WasteType,
        default: WasteType.MENU
    })
    type: WasteType;

    @Column()
    itemId: number; // ID of Menu or Product

    @Column()
    itemName: string; // Snapshot of name

    @Column('decimal', { precision: 10, scale: 2 })
    quantity: number;

    @Column({
        type: 'enum',
        enum: WasteAction
    })
    action: WasteAction;

    @Column('text')
    reason: string; // Mandatory reason (e.g., "Basi", "Sisa Layak", "Ada Hewan")

    @Column({ default: false })
    resolved: boolean; // For complaints, true if replaced/refunded

    @CreateDateColumn()
    createdAt: Date;
}
