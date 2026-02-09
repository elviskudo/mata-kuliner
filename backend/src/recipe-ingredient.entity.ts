import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Recipe } from './recipe.entity';
import { Product } from './product.entity';

@Entity({ schema: 'kitchen' })
export class RecipeIngredient {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
    recipe: Recipe;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    @Column('decimal')
    quantity: number;
}
