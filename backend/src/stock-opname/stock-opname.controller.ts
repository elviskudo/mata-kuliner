import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { StockOpnameService } from './stock-opname.service';
import { StockOpname, OpnameStatus } from '../stock-opname.entity';

@Controller('stock-opname')
export class StockOpnameController {
    constructor(private readonly opnameService: StockOpnameService) { }

    @Get()
    findAll() {
        return this.opnameService.findAll();
    }

    @Post()
    create(@Body() data: Partial<StockOpname>) {
        return this.opnameService.create(data);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: OpnameStatus
    ) {
        return this.opnameService.updateStatus(id, status);
    }
}
