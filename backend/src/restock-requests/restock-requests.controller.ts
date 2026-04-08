import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { RestockRequestsService } from './restock-requests.service';
import { RestockRequest, RestockRequestStatus } from './restock-request.entity';

@Controller('restock-requests')
export class RestockRequestsController {
    constructor(private readonly restockRequestsService: RestockRequestsService) {}

    @Get()
    findAll(): Promise<RestockRequest[]> {
        return this.restockRequestsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<RestockRequest> {
        return this.restockRequestsService.findOne(+id);
    }

    @Post()
    create(@Body() createDto: Partial<RestockRequest>): Promise<RestockRequest> {
        return this.restockRequestsService.create(createDto);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: RestockRequestStatus; approvedBy?: string; notes?: string }
    ): Promise<RestockRequest> {
        return this.restockRequestsService.updateStatus(+id, body.status, body.approvedBy, body.notes);
    }
}
