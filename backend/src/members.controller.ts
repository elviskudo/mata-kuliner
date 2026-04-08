import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from './member.entity';

@Controller('members')
export class MembersController {
    constructor(private readonly membersService: MembersService) { }

    @Get()
    findAll(@Query('search') search: string) {
        return this.membersService.findAll(search);
    }

    @Get('stats')
    getStats(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.membersService.getStats(startDate, endDate);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.membersService.findOne(+id);
    }

    @Get(':id/transactions')
    getTransactions(@Param('id') id: string) {
        return this.membersService.getMemberTransactions(+id);
    }

    @Post()
    create(@Body() member: Partial<Member>) {
        return this.membersService.create(member);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() member: Partial<Member>) {
        return this.membersService.update(+id, member);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.membersService.remove(+id);
    }
}
