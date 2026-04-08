import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login/employee')
    async loginEmployee(@Body() body: { identifier: string; password?: string }) {
        return this.authService.loginEmployee(body.identifier, body.password || '');
    }

    @Post('login/owner/request-otp')
    async requestOwnerLoginOtp(@Body() body: { email: string }) {
        return this.authService.requestOwnerLoginOtp(body.email);
    }

    @Post('login/owner/verify')
    async verifyOwnerLoginOtp(@Body() body: { email: string; otp: string }) {
        return this.authService.verifyOwnerLoginOtp(body.email, body.otp);
    }

    @Post('owner/register/request-otp')
    async requestOwnerRegisterOtp(@Body() body: { email: string }) {
        return this.authService.requestOwnerRegisterOtp(body.email);
    }

    @Post('owner/register/verify')
    async verifyOwnerRegisterOtp(@Body() body: { email: string; otp: string; username?: string; password?: string }) {
        return this.authService.verifyOwnerRegisterOtp(body.email, body.otp, body.username, body.password);
    }
}
