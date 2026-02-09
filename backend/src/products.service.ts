import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    findAll(): Promise<Product[]> {
        return this.productsRepository.find();
    }

    findOne(id: number): Promise<Product | null> {
        return this.productsRepository.findOneBy({ id });
    }

    async create(productData: Partial<Product>): Promise<Product> {
        const existing = await this.productsRepository.findOneBy({ name: productData.name });
        if (existing) {
            throw new ConflictException(`Bahan dengan nama "${productData.name}" sudah ada!`);
        }
        const product = this.productsRepository.create(productData);
        return this.productsRepository.save(product);
    }

    async update(id: number, productData: Partial<Product>): Promise<Product | null> {
        await this.productsRepository.update(id, productData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.productsRepository.delete(id);
    }

    async getStats() {
        const products = await this.findAll();
        const totalItems = products.length;
        const lowStockItems = products.filter(p => p.stock <= p.minStock);
        const lowStockCount = lowStockItems.filter(p => p.stock > 0).length;
        const outOfStockCount = lowStockItems.filter(p => p.stock === 0).length;
        const availableStockCount = totalItems - lowStockItems.length;

        return {
            summary: [
                { label: 'Total Bahan', value: totalItems, icon: 'list', color: 'blue' },
                { label: 'Stok Tersedia', value: availableStockCount, icon: 'check', color: 'green' },
                { label: 'Stok Menipis', value: lowStockCount, icon: 'alert', color: 'orange' },
                { label: 'Stok Habis', value: outOfStockCount, icon: 'error', color: 'red' },
            ],
            lowStockItems: lowStockItems.map(p => ({
                id: p.id,
                name: p.name,
                stock: p.stock,
                minStock: p.minStock,
                unit: p.unit,
                image: p.image,
            })),
        };
    }
}
