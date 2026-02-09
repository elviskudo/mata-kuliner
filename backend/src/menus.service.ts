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

        // Return menus with their stock (produced portions ready to sell)
        return menus.map(menu => ({
            ...menu,
            isAvailable: Number(menu.stock) > 0,
            availableQuantity: Number(menu.stock),
        }));
    }

    async create(menuData: any) {
        const { ingredients, recipeId, productionQuantity, ...details } = menuData;

        // Check for duplicate menu name
        const existing = await this.menuRepository.findOneBy({ name: details.name });
        if (existing) {
            throw new ConflictException(`Menu dengan nama "${details.name}" sudah ada!`);
        }

        const menu = this.menuRepository.create({
            ...details,
            price: details.price || 0,
            yield: 1, // Default yield, will be updated from recipe if recipeId is provided
            stock: 0, // Initial stock is 0, will be updated if production happens
            recipeId: recipeId ? parseInt(recipeId) : undefined,
        });
        const savedMenu = (await this.menuRepository.save(menu)) as unknown as Menu;

        let menuIngredients: any[] = [];
        let recipeYield = 1;

        if (recipeId) {
            // Fetch ingredients from recipe
            const recipe = await this.productRepository.manager.getRepository('Recipe').findOne({
                where: { id: recipeId },
                relations: ['ingredients', 'ingredients.product'],
            }) as any;

            if (recipe) {
                // Always use yield from recipe
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

            // PRODUCTION SYSTEM: If productionQuantity is provided, produce the menu
            if (productionQuantity && productionQuantity > 0) {
                // Decrease stock from products (like taking ingredients from storage to kitchen)
                for (const item of menuIngredients) {
                    const productId = item.product.id;
                    const totalNeeded = Number(item.quantity) * productionQuantity;
                    await this.productRepository.decrement({ id: productId }, 'stock', totalNeeded);
                }

                // Increase menu stock (produced portions ready to sell)
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
            // Simple sync: delete old and create new
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
        // Delete associated ingredients first
        await this.ingredientRepository.delete({ menu: { id } });
        // Delete the menu
        return this.menuRepository.delete(id);
    }
}
