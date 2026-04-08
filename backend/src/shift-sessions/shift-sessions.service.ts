import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftSession, ShiftStatus } from './shift-session.entity';

@Injectable()
export class ShiftSessionsService {
    constructor(
        @InjectRepository(ShiftSession)
        private shiftSessionsRepository: Repository<ShiftSession>,
    ) { }

    async getActiveShift(): Promise<ShiftSession | null> {
        return this.shiftSessionsRepository.findOne({
            where: { status: ShiftStatus.OPEN },
            order: { startTime: 'DESC' }
        });
    }

    async startShift(cashierName: string, startingCash: number): Promise<ShiftSession> {
        const active = await this.getActiveShift();
        if (active) {
            throw new BadRequestException('A shift is already open. Please close it first.');
        }

        const newShift = this.shiftSessionsRepository.create({
            cashierName,
            startingCash,
            status: ShiftStatus.OPEN
        });

        return this.shiftSessionsRepository.save(newShift);
    }

    async endShift(endingCash: number): Promise<ShiftSession> {
        const active = await this.getActiveShift();
        if (!active) {
            throw new BadRequestException('No active shift to close.');
        }

        active.endingCash = endingCash;
        active.status = ShiftStatus.CLOSED;
        active.endTime = new Date();

        return this.shiftSessionsRepository.save(active);
    }

    async findAll(): Promise<ShiftSession[]> {
        return this.shiftSessionsRepository.find({ order: { startTime: 'DESC' } });
    }
}
