import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftSessionsService } from './shift-sessions.service';
import { ShiftSessionsController } from './shift-sessions.controller';
import { ShiftSession } from './shift-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftSession])],
  controllers: [ShiftSessionsController],
  providers: [ShiftSessionsService],
})
export class ShiftSessionsModule { }
