import { Controller, Get, Post, Body } from '@nestjs/common';
import { WasteLogsService } from './waste-logs.service';

@Controller('waste-logs')
export class WasteLogsController {
    constructor(private readonly wasteLogsService: WasteLogsService) { }

    @Get()
    findAll() {
        return this.wasteLogsService.findAll();
    }

    @Post()
    createLog(@Body() payload: any) {
        return this.wasteLogsService.createLog(payload);
    }
}
