import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Product } from './product.entity';
import { Menu } from './menu.entity';
import { MenuIngredient } from './menu-ingredient.entity';
import { Order } from './order.entity';
import { Employee } from './employee.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { Recipe } from './recipe.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // WARNING: Only for development!
    }),
    TypeOrmModule.forFeature([Product, Order, Employee, Menu, MenuIngredient, Recipe, RecipeIngredient]),
  ],
  controllers: [AppController, ProductsController, MenusController, RecipesController],
  providers: [AppService, ProductsService, MenusService, RecipesService],
})
export class AppModule { }
