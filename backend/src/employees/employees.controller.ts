import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    findAll() {
        return this.employeesService.findAll();
    }

    @Post()
    create(@Body() employeeData: any) {
        return this.employeesService.create(employeeData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.employeesService.remove(+id);
    }
}
