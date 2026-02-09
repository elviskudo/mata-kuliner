import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MenuIngredient } from './menu-ingredient.entity';

@Entity({ schema: 'kitchen' })
export class Menu {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    category: string;

    @Column('decimal')
    price: number;

    @Column({ nullable: true })
    image: string;

    @Column('decimal', { default: 1 })
    yield: number;

    @Column({ nullable: true })
    recipeId: number;

    @Column('decimal', { default: 0 })
    stock: number;

    @OneToMany(() => MenuIngredient, (ingredient: MenuIngredient) => ingredient.menu, { cascade: true })
    ingredients: MenuIngredient[];
}
