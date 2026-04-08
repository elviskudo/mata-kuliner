import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    private readonly fonnteToken = 'LZVZxxRzFK9uQQbu6eGC'; // Consider moving to .env in production

    async sendMessage(target: string, message: string): Promise<boolean> {
        try {
            const response = await axios.post(
                'https://api.fonnte.com/send',
                {
                    target,
                    message,
                    delay: '2', // Optional slight delay
                },
                {
                    headers: {
                        Authorization: this.fonnteToken,
                    },
                }
            );

            this.logger.log(`WhatsApp message sent to ${target}. Response: ${JSON.stringify(response.data)}`);
            return response.data?.status || false;
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp message to ${target}`, error.stack);
            return false;
        }
    }
}
