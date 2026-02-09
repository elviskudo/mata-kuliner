import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'kitchen' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    category: string;

    @Column('decimal')
    price: number;

    @Column({ default: 0 })
    stock: number;

    @Column({ default: 0 })
    minStock: number;

    @Column()
    unit: string;

    @Column({ nullable: true })
    image: string;
}
