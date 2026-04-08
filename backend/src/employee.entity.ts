import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'owner' })
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    role: string; // manager, staff, etc.

    @Column({ unique: true })
    employeeCode: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ unique: true, nullable: true })
    email?: string; // Optional for multi-login/owner creation

    @Column({ nullable: true })
    password: string;
}
