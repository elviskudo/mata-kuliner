import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { MenuIngredient } from './menu-ingredient.entity';
import { Product } from './product.entity';

@Injectable()
export class MenusService {
    constructor(
        @InjectRepository(Menu)
        private menuRepository: Repository<Menu>,
        @InjectRepository(MenuIngredient)
        private ingredientRepository: Repository<MenuIngredient>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async findAll() {
        const menus = await this.menuRepository.find({
            relations: ['ingredients', 'ingredients.product'],
        });

        return menus.map(menu => {
            // Determine availability based on ingredient stock
            let isAvailable = true;
            let outOfStockIngredient: string | null = null;

            if (menu.ingredients && menu.ingredients.length > 0) {
                for (const ing of menu.ingredients) {
                    if (!ing.product) continue;
                    const productStock = Number(ing.product.stock);
                    const needed = Number(ing.quantity);
                    if (productStock < needed) {
                        isAvailable = false;
                        outOfStockIngredient = ing.product.name;
                        break;
                    }
                }
            }

            return {
                ...menu,
                isAvailable,
                outOfStockIngredient,
                availableQuantity: Number(menu.stock),
            };
        });
    }

    async create(menuData: any) {
        console.log('Creating menu with data:', JSON.stringify(menuData));
        const { ingredients, recipeId, productionQuantity, ...details } = menuData;

        // Check for duplicate menu name
        const existing = await this.menuRepository.findOneBy({ name: details.name });
        if (existing) {
            throw new ConflictException(`Menu dengan nama "${details.name}" sudah ada!`);
        }

        const menu = this.menuRepository.create({
            ...details,
            price: details.price || 0,
            yield: 1,
            stock: 0,
            recipeId: recipeId ? parseInt(recipeId) : undefined,
        });
        const savedMenu = (await this.menuRepository.save(menu)) as unknown as Menu;

        let menuIngredients: any[] = [];
        let recipeYield = 1;

        if (recipeId) {
            const recipe = await this.productRepository.manager.getRepository('Recipe').findOne({
                where: { id: recipeId },
                relations: ['ingredients', 'ingredients.product'],
            }) as any;

            if (recipe) {
                recipeYield = Number(recipe.yield);
                await this.menuRepository.update(savedMenu.id, { yield: recipeYield });

                if (recipe.ingredients) {
                    menuIngredients = recipe.ingredients.map((ing: any) => ({
                        menu: savedMenu,
                        product: ing.product,
                        quantity: ing.quantity,
                    }));
                }
            }
        } else if (ingredients && ingredients.length > 0) {
            menuIngredients = ingredients.map((ing: any) => ({
                menu: savedMenu,
                product: { id: ing.productId },
                quantity: ing.quantity,
            }));
        }

        if (menuIngredients.length > 0) {
            await this.ingredientRepository.save(menuIngredients);

            if (productionQuantity && productionQuantity > 0) {
                for (const item of menuIngredients) {
                    const productId = item.product.id;
                    const totalNeeded = Number(item.quantity) * productionQuantity;

                    // Prevent ingredient stock from going below 0
                    const product = await this.productRepository.findOneBy({ id: productId });
                    if (product) {
                        const newStock = Math.max(0, Number(product.stock) - totalNeeded);
                        await this.productRepository.update(productId, { stock: newStock });
                    }
                }

                const producedPortions = productionQuantity * recipeYield;
                await this.menuRepository.update(savedMenu.id, { stock: producedPortions });
            }
        }

        return this.findOne(savedMenu.id);
    }

    async update(id: number, menuData: any) {
        const { ingredients, recipeId, ...details } = menuData;

        await this.menuRepository.update(id, {
            ...details,
            recipeId: recipeId ? parseInt(recipeId) : undefined,
        });
        const menu = await this.findOne(id);

        if (ingredients) {
            await this.ingredientRepository.delete({ menu: { id } });

            if (ingredients.length > 0) {
                const menuIngredients = ingredients.map((ing: any) => ({
                    menu,
                    product: { id: ing.productId },
                    quantity: ing.quantity,
                }));
                await this.ingredientRepository.save(menuIngredients);
            }
        }

        return this.findOne(id);
    }

    async findOne(id: number) {
        return this.menuRepository.findOne({
            where: { id },
            relations: ['ingredients', 'ingredients.product'],
        });
    }

    async remove(id: number) {
        await this.ingredientRepository.delete({ menu: { id } });
        return this.menuRepository.delete(id);
    }

    async reset() {
        console.log('Resetting all menus...');
        try {
            await this.ingredientRepository.createQueryBuilder().delete().execute();
            await this.menuRepository.createQueryBuilder().delete().execute();
            console.log('Menus reset successfully');
            return { message: 'All menus have been reset' };
        } catch (error) {
            console.error('Reset failed:', error);
            throw new Error('Failed to reset menus');
        }
    }
}
