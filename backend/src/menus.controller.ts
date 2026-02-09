import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MenusService } from './menus.service';

@Controller('menus')
export class MenusController {
    constructor(private readonly menusService: MenusService) { }

    @Get()
    findAll() {
        return this.menusService.findAll();
    }

    @Post()
    create(@Body() menuData: any) {
        return this.menusService.create(menuData);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.menusService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() menuData: any) {
        return this.menusService.update(+id, menuData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.menusService.remove(+id);
    }
}
