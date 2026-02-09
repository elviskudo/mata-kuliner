import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './recipe.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { Product } from './product.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class RecipesService {
    constructor(
        @InjectRepository(Recipe)
        private recipeRepository: Repository<Recipe>,
        @InjectRepository(RecipeIngredient)
        private ingredientRepository: Repository<RecipeIngredient>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async findAll() {
        return this.recipeRepository.find({
            relations: ['ingredients', 'ingredients.product'],
        });
    }

    async findOne(id: number) {
        return this.recipeRepository.findOne({
            where: { id },
            relations: ['ingredients', 'ingredients.product'],
        });
    }

    async create(recipeData: any) {
        const { ingredients, ...details } = recipeData;

        // Check for duplicate recipe name
        const existing = await this.recipeRepository.findOneBy({ name: details.name });
        if (existing) {
            throw new ConflictException(`Resep dengan nama "${details.name}" sudah ada!`);
        }

        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                const product = await this.productRepository.findOneBy({ id: ing.productId });
                if (!product) {
                    throw new BadRequestException(`Produk dengan ID ${ing.productId} tidak ditemukan`);
                }
            }
        }

        const recipe = this.recipeRepository.create(details);
        const savedRecipe = await this.recipeRepository.save(recipe);

        if (ingredients && ingredients.length > 0) {
            const recipeIngredients = ingredients.map((ing: any) => ({
                recipe: savedRecipe,
                product: { id: ing.productId },
                quantity: ing.quantity,
            }));
            await this.ingredientRepository.save(recipeIngredients);
        }

        return this.findOne((savedRecipe as unknown as Recipe).id);
    }

    async update(id: number, recipeData: any) {
        const { ingredients, ...details } = recipeData;

        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                const product = await this.productRepository.findOneBy({ id: ing.productId });
                if (!product) {
                    throw new BadRequestException(`Produk dengan ID ${ing.productId} tidak ditemukan`);
                }
            }
        }

        await this.recipeRepository.update(id, details);
        const recipe = await this.findOne(id);

        if (ingredients) {
            await this.ingredientRepository.delete({ recipe: { id } });

            if (ingredients.length > 0) {
                const recipeIngredients = ingredients.map((ing: any) => ({
                    recipe,
                    product: { id: ing.productId },
                    quantity: ing.quantity,
                }));
                await this.ingredientRepository.save(recipeIngredients);
            }
        }

        return this.findOne(id);
    }

    async remove(id: number) {
        await this.ingredientRepository.delete({ recipe: { id } });
        return this.recipeRepository.delete(id);
    }
}
