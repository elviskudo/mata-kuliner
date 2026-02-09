import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Delete,
    Body,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

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
    create(@Body() recipeData: any, @UploadedFile() file: Express.Multer.File) {
        const data = {
            ...recipeData,
            yield: recipeData.yield ? parseFloat(recipeData.yield) : 1,
            ingredients: recipeData.ingredients ? (typeof recipeData.ingredients === 'string' ? JSON.parse(recipeData.ingredients) : recipeData.ingredients) : [],
            image: file ? `/uploads/${file.filename}` : recipeData.image,
        };
        return this.recipesService.create(data);
    }

    @Get()
    findAll() {
        return this.recipesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.recipesService.findOne(+id);
    }

    @Put(':id')
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
    update(@Param('id') id: string, @Body() recipeData: any, @UploadedFile() file: Express.Multer.File) {
        const data = {
            ...recipeData,
            yield: recipeData.yield ? parseFloat(recipeData.yield) : undefined,
            ingredients: recipeData.ingredients ? (typeof recipeData.ingredients === 'string' ? JSON.parse(recipeData.ingredients) : recipeData.ingredients) : undefined,
        };
        if (file) {
            data.image = `/uploads/${file.filename}`;
        }
        return this.recipesService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.recipesService.remove(+id);
    }
}
