import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestockRequestsService } from './restock-requests.service';
import { RestockRequestsController } from './restock-requests.controller';
import { RestockRequest } from './restock-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RestockRequest])],
  providers: [RestockRequestsService],
  controllers: [RestockRequestsController]
})
export class RestockRequestsModule {}
