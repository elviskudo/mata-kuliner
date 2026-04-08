import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Owner {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true, nullable: true }) // nullable for existing rows, in prod should handle migrations
    username?: string;

    @Column({ nullable: true })
    password?: string;

    @CreateDateColumn()
    createdAt: Date;
}
