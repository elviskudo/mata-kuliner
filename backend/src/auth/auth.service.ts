import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employee.entity';
import { Owner } from '../owner.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
    private transporter: nodemailer.Transporter;
    private otpStore = new Map<string, { otp: string; expiresAt: number }>();

    constructor(
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        @InjectRepository(Owner)
        private ownerRepository: Repository<Owner>,
    ) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async loginEmployee(identifier: string, inputPass: string): Promise<any> {
        if (!identifier || !inputPass) {
            throw new BadRequestException('Email/No Handphone/Nama dan kata sandi wajib diisi');
        }

        const employee = await this.employeesRepository.findOne({
            where: [
                { phone: identifier },
                { email: identifier },
                { name: identifier }
            ]
        });

        if (!employee) {
            throw new UnauthorizedException('Karyawan tidak ditemukan');
        }

        if (employee.password !== inputPass) {
            throw new UnauthorizedException('Kata sandi salah');
        }

        return {
            message: 'Login berhasil',
            role: employee.role,
            user: {
                id: employee.id,
                name: employee.name,
                role: employee.role,
                email: employee.email,
                phone: employee.phone
            }
        };
    }

    async requestOwnerLoginOtp(email: string): Promise<{ message: string }> {
        const owner = await this.ownerRepository.findOne({ where: { email } });
        if (!owner) {
            throw new UnauthorizedException('Email belum terdaftar sebagai Owner. Silakan buat akun terlebih dahulu.');
        }

        await this.sendOtpEmail(email);
        return { message: 'OTP telah dikirim ke email' };
    }

    async verifyOwnerLoginOtp(email: string, inputOtp: string): Promise<any> {
        this.verifyOtp(email, inputOtp);

        const owner = await this.ownerRepository.findOne({ where: { email } });

        return {
            message: 'Login Owner berhasil',
            role: 'Owner',
            user: {
                id: owner?.id,
                email: email,
                username: owner?.username,
                role: 'Owner'
            }
        };
    }

    private async sendOtpEmail(email: string): Promise<void> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        this.otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`);

        try {
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                await this.transporter.sendMail({
                    from: process.env.SMTP_USER || '"Mata Kuliner System" <no-reply@matakuliner.com>',
                    to: email,
                    subject: 'Kode OTP Mata Kuliner Anda',
                    text: `Kode Rahasia OTP Anda adalah: ${otp}. Kode ini berlaku selama 5 menit. Tolong jangan berikan kode ini ke orang lain.`,
                    html: `<p>Kode Rahasia OTP Anda adalah: <strong>${otp}</strong>.<br/>Kode ini berlaku selama 5 menit.<br/>Tolong jangan berikan kode ini ke orang lain.</p>`,
                });
                console.log(`[AUTH] OTP terkirim ke email: ${email}`);
            } else {
                console.warn('[AUTH] SMTP credentials not set. Cek terminal untuk pass OTP.');
            }
        } catch (error) {
            console.warn('[AUTH] Gagal mengirim email (SMTP error). Pastikan konfigurasi .env SMTP sudah benar.');
            console.warn(error);
        }
    }

    private verifyOtp(email: string, inputOtp: string): void {
        const record = this.otpStore.get(email);

        if (!record) {
            throw new UnauthorizedException('Tidak ada OTP aktif untuk email ini');
        }

        if (Date.now() > record.expiresAt) {
            this.otpStore.delete(email);
            throw new UnauthorizedException('OTP sudah kadaluarsa');
        }

        if (record.otp !== inputOtp) {
            throw new UnauthorizedException('OTP salah');
        }

        this.otpStore.delete(email);
    }

    async requestOwnerRegisterOtp(email: string): Promise<{ message: string }> {
        const existingOwner = await this.ownerRepository.findOne({ where: { email } });
        if (existingOwner) {
            throw new BadRequestException('Email sudah terdaftar. Silakan menuju halaman login Owner.');
        }

        await this.sendOtpEmail(email);
        return { message: 'OTP telah dikirim ke email' };
    }

    async verifyOwnerRegisterOtp(email: string, inputOtp: string, username?: string, password?: string): Promise<any> {
        this.verifyOtp(email, inputOtp);

        if (!username || !password) {
            throw new BadRequestException('Username dan Password diwajibkan untuk meregistrasi akun Owner');
        }

        const newOwner = this.ownerRepository.create({
            email,
            username,
            password
        });

        await this.ownerRepository.save(newOwner);

        return {
            message: 'Registrasi Owner berhasil',
            role: 'Owner',
            user: {
                id: newOwner.id,
                email: newOwner.email,
                username: newOwner.username,
                role: 'Owner'
            }
        };
    }
}
