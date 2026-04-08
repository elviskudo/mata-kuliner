import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Employee } from '../employee.entity';
import { Owner } from '../owner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Owner])],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
