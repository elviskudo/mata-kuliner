import { Module } from '@nestjs/common';
import { StockOpnameService } from './stock-opname.service';
import { StockOpnameController } from './stock-opname.controller';

@Module({
  providers: [StockOpnameService],
  controllers: [StockOpnameController]
})
export class StockOpnameModule {}
