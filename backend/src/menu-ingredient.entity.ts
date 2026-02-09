import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Menu } from './menu.entity';
import { Product } from './product.entity';

@Entity({ schema: 'kitchen' })
export class MenuIngredient {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Menu, (menu) => menu.ingredients)
    menu: Menu;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    @Column('decimal')
    quantity: number;
}
