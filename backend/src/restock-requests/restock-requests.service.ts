import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestockRequest, RestockRequestStatus } from './restock-request.entity';

@Injectable()
export class RestockRequestsService {
    constructor(
        @InjectRepository(RestockRequest)
        private restockRequestRepository: Repository<RestockRequest>,
    ) {}

    async findAll(): Promise<RestockRequest[]> {
        return this.restockRequestRepository.find({
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number): Promise<RestockRequest> {
        const request = await this.restockRequestRepository.findOne({ where: { id } });
        if (!request) {
            throw new NotFoundException(`Restock Request with ID ${id} not found`);
        }
        return request;
    }

    async create(createDto: Partial<RestockRequest>): Promise<RestockRequest> {
        let total = 0;
        if (createDto.items && Array.isArray(createDto.items)) {
            total = createDto.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.estimatedPrice || 0)), 0);
        }
        createDto.totalEstimatedPrice = total;
        
        const newRequest = this.restockRequestRepository.create(createDto);
        return await this.restockRequestRepository.save(newRequest);
    }

    async updateStatus(id: number, status: RestockRequestStatus, approvedBy?: string, notes?: string): Promise<RestockRequest> {
        const request = await this.findOne(id);
        
        request.status = status;
        if (approvedBy) request.approvedBy = approvedBy;
        if (notes) request.notes = notes;
        
        return await this.restockRequestRepository.save(request);
    }
}
