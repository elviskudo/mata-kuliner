import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class StoreSetting {
    @PrimaryColumn()
    key: string; // e.g., 'IS_STORE_OPEN'

    @Column()
    value: string; // e.g., 'true', 'false'
}
