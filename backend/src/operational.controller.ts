import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { OperationalService } from './operational.service';
import { WasteAction, WasteType } from './waste-log.entity';

@Controller('operational')
export class OperationalController {
    constructor(private readonly operationalService: OperationalService) { }

    @Get('store-status')
    async getStoreStatus() {
        return this.operationalService.getStoreStatus();
    }

    @Post('store-status')
    async updateStoreStatus(@Body() body: { isOpen: boolean }) {
        return this.operationalService.updateStoreStatus(body.isOpen);
    }

    @Get('closing-summary')
    async getClosingSummary(@Query('date') date: string) {
        if (!date) throw new BadRequestException('Date is required');
        return this.operationalService.getClosingSummary(date);
    }

    @Get('closings')
    async getClosings(@Query('from') from: string, @Query('to') to: string) {
        if (!from || !to) throw new BadRequestException('from and to date are required');
        return this.operationalService.getClosingsByDateRange(from, to);
    }

    @Post('close-day')
    async closeDay(@Body() body: any) {
        return this.operationalService.closeDay(body);
    }

    @Post('reset-closing')
    async resetClosing(@Body() body: { date: string }) {
        return this.operationalService.deleteClosing(body.date);
    }

    @Post('complaint')
    async registerComplaint(@Body() body: { itemId: number; reason: string; replace: boolean; createdAt?: string }) {
        return this.operationalService.registerComplaint(body);
    }

    @Get('waste-report')
    async getWasteReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.operationalService.getWasteReport(startDate, endDate);
    }

    @Get('hourly-transactions')
    async getHourlyTransactions(@Query('date') date: string, @Query('hour') hour: string) {
        return this.operationalService.getHourlyTransactions(date, hour);
    }

    @Get('closing-menus')
    async getClosingMenus(@Query('date') date: string) {
        return this.operationalService.getClosingMenus(date);
    }

    @Get('debug-snapshots')
    async getDebugSnapshots() {
        return this.operationalService.getAllSnapshots();
    }
}
