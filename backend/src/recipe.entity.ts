import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Entity({ schema: 'kitchen' })
export class Recipe {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    image: string;

    @Column('decimal', { default: 1 })
    yield: number;

    @OneToMany(() => RecipeIngredient, (ingredient: RecipeIngredient) => ingredient.recipe, { cascade: true })
    ingredients: RecipeIngredient[];
}
