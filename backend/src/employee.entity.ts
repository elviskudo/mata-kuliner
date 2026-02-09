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
}
