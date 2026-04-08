import { Controller, Get, Post, Body, Query, Patch, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(@Body() transactionData: any) {
        return this.transactionsService.create(transactionData);
    }

    @Post('checkout')
    checkout(@Body() checkoutData: any) {
        return this.transactionsService.checkout(checkoutData);
    }

    @Patch('checkout/:id/confirm')
    confirmCheckout(@Param('id') id: string) {
        return this.transactionsService.confirmCheckout(+id);
    }

    @Get()
    findAll() {
        return this.transactionsService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.transactionsService.getStats();
    }

    @Get('recent')
    getRecent() {
        return this.transactionsService.getRecent(10);
    }

    @Get('report')
    getReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.transactionsService.getFinancialReport(startDate, endDate);
    }
}
