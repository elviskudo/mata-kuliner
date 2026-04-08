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
import { Transaction } from './transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DailyClosing } from './daily-closing.entity';
import { WasteLog } from './waste-log.entity';
import { Member } from './member.entity';
import { StoreSetting } from './store-setting.entity';
import { MenuSnapshot } from './menu-snapshot.entity';
import { OperationalController } from './operational.controller';
import { OperationalService } from './operational.service';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { EmployeesService } from './employees/employees.service';
import { EmployeesController } from './employees/employees.controller';
import { WasteLogsService } from './waste-logs/waste-logs.service';
import { WasteLogsController } from './waste-logs/waste-logs.controller';
import { StockOpname } from './stock-opname.entity';
import { StockOpnameService } from './stock-opname/stock-opname.service';
import { StockOpnameController } from './stock-opname/stock-opname.controller';
import { TablesModule } from './tables/tables.module';
import { Table } from './tables/table.entity';
import { ShiftSessionsModule } from './shift-sessions/shift-sessions.module';
import { ShiftSession } from './shift-sessions/shift-session.entity';
import { AuthModule } from './auth/auth.module';
import { Owner } from './owner.entity';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { RestockRequestsModule } from './restock-requests/restock-requests.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // WARNING: Only for development!
    }),
    TypeOrmModule.forFeature([
      Product,
      Order,
      Employee,
      Menu,
      MenuIngredient,
      Recipe,
      RecipeIngredient,
      Transaction,
      DailyClosing,
      WasteLog,
      Member,
      StoreSetting,
      MenuSnapshot,
      StockOpname,
      Owner,
      // Table and ShiftSession are managed by their own modules (TablesModule, ShiftSessionsModule)
      // Do NOT register them here again to avoid duplicate repository errors
    ]),
    TablesModule,
    ShiftSessionsModule,
    AuthModule,
    WhatsappModule,
    RestockRequestsModule,
  ],
  controllers: [
    AppController,
    ProductsController,
    MenusController,
    RecipesController,
    TransactionsController,
    OrdersController,
    OperationalController,
    MembersController,
    EmployeesController,
    WasteLogsController,
    StockOpnameController
  ],
  providers: [
    AppService,
    ProductsService,
    MenusService,
    RecipesService,
    TransactionsService,
    OrdersService,
    OperationalService,
    MembersService,
    EmployeesService,
    WasteLogsService,
    StockOpnameService
  ],
})
export class AppModule { }
