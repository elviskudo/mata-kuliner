import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.productsService.getStats();
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    create(@Body() productData: any, @UploadedFile() file: Express.Multer.File) {
        const data = {
            ...productData,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock),
            minStock: parseInt(productData.minStock),
            image: file ? `/uploads/${file.filename}` : null,
        };
        return this.productsService.create(data);
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    update(@Param('id') id: string, @Body() productData: any, @UploadedFile() file: Express.Multer.File) {
        const data = {
            ...productData,
            price: productData.price ? parseFloat(productData.price) : undefined,
            stock: productData.stock ? parseInt(productData.stock) : undefined,
            minStock: productData.minStock ? parseInt(productData.minStock) : undefined,
        };
        if (file) {
            data.image = `/uploads/${file.filename}`;
        }
        return this.productsService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(+id);
    }
}
