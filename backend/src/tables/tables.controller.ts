import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TablesService } from './tables.service';
import { Table, TableStatus } from './table.entity';

@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) { }

    @Post()
    create(@Body() createTableDto: Partial<Table>) {
        return this.tablesService.create(createTableDto);
    }

    @Get()
    findAll() {
        return this.tablesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tablesService.findOne(+id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: TableStatus) {
        return this.tablesService.updateStatus(+id, status);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tablesService.remove(+id);
    }
}
