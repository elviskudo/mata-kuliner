import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employee.entity';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
    ) { }

    async findAll(): Promise<Employee[]> {
        return this.employeesRepository.find();
    }

    async create(employeeData: Partial<Employee>): Promise<Employee> {
        // Simple logic to generate an employeeCode if not provided
        if (!employeeData.employeeCode) {
            const count = await this.employeesRepository.count();
            employeeData.employeeCode = `EMP${(count + 1).toString().padStart(3, '0')}`;
        }

        const employee = this.employeesRepository.create(employeeData);
        return this.employeesRepository.save(employee);
    }

    async remove(id: number): Promise<void> {
        const result = await this.employeesRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Employee with ID "${id}" not found`);
        }
    }
}
