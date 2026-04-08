import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }

    @Get('has-pending')
    async hasPending() {
        const hasPending = await this.ordersService.hasPendingOrders();
        return { hasPending };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(+id);
    }

    @Post()
    create(@Body() orderData: any) {
        return this.ordersService.create(orderData);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.ordersService.updateStatus(+id, body.status);
    }

    @Delete('all')
    deleteAll() {
        return this.ordersService.deleteAllOrders();
    }
}
