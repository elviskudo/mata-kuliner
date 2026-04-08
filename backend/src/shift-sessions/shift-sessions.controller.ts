import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { ShiftSessionsService } from './shift-sessions.service';

@Controller('shift-sessions')
export class ShiftSessionsController {
    constructor(private readonly shiftSessionsService: ShiftSessionsService) { }

    @Get('active')
    getActiveShift() {
        return this.shiftSessionsService.getActiveShift();
    }

    @Post('start')
    startShift(@Body() body: { cashierName: string; startingCash: number }) {
        return this.shiftSessionsService.startShift(body.cashierName, body.startingCash);
    }

    @Post('end')
    endShift(@Body() body: { endingCash: number }) {
        return this.shiftSessionsService.endShift(body.endingCash);
    }

    @Get()
    findAll() {
        return this.shiftSessionsService.findAll();
    }
}
