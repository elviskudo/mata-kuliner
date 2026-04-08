import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { Transaction } from './transaction.entity';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Injectable()
export class MembersService {
    constructor(
        @InjectRepository(Member)
        private membersRepository: Repository<Member>,
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        private whatsappService: WhatsappService,
    ) { }

    async findAll(query?: string): Promise<Member[]> {
        if (query) {
            return this.membersRepository
                .createQueryBuilder('member')
                .where('member.name ILIKE :query OR member.email ILIKE :query OR member.phone ILIKE :query', { query: `%${query}%` })
                .orderBy('member.name', 'ASC')
                .getMany();
        }
        return this.membersRepository.find({ order: { name: 'ASC' } });
    }

    async getStats(startDate: string, endDate: string) {
        // Aggregate transactions by month for the chart
        const start = startDate ? `${startDate} 00:00:00` : new Date(new Date().getFullYear(), 0, 1).toISOString();
        const end = endDate ? `${endDate} 23:59:59` : new Date(new Date().getFullYear(), 11, 31).toISOString();

        const rawData = await this.transactionsRepository
            .createQueryBuilder('transaction')
            .select("TO_CHAR(transaction.createdAt, 'Mon')", 'name')
            .addSelect("COUNT(transaction.id)", 'orders')
            .where("transaction.memberId IS NOT NULL")
            .andWhere("transaction.createdAt BETWEEN :start AND :end", { start, end })
            .groupBy("TO_CHAR(transaction.createdAt, 'Mon')")
            .addGroupBy("EXTRACT(MONTH FROM transaction.createdAt)")
            .orderBy("EXTRACT(MONTH FROM transaction.createdAt)", "ASC")
            .getRawMany();

        return rawData.map(d => ({
            name: d.name,
            orders: Number(d.orders)
        }));
    }

    async getMemberTransactions(memberId: number) {
        return this.transactionsRepository.find({
            where: { memberId },
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Member | null> {
        return this.membersRepository.findOneBy({ id });
    }

    async create(member: Partial<Member>): Promise<Member> {
        const newMember = this.membersRepository.create(member);
        const savedMember = await this.membersRepository.save(newMember);

        // Send WhatsApp Welcome Message if phone is provided
        if (savedMember.phone) {
            const message = `Halo ${savedMember.name}!\n\nSelamat datang di Mata Kuliner. Pendaftaran Member Anda telah berhasil.\nKumpulkan terus poin Anda dengan bertransaksi dan nikmati berbagai penukaran menarik!\n\nTerima kasih,\nMata Kuliner`;
            this.whatsappService.sendMessage(savedMember.phone, message).catch(err => {
                console.error('Failed to send WA welcome message:', err);
            });
        }

        return savedMember;
    }

    async update(id: number, member: Partial<Member>): Promise<Member | null> {
        await this.membersRepository.update(id, member);
        return this.membersRepository.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        await this.membersRepository.delete(id);
    }
}
