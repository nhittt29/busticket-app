import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from '../services/ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    async chat(@Body() body: { message: string; history?: { role: 'user' | 'model'; parts: string }[] }) {
        if (!body.message) {
            throw new BadRequestException('Message is required');
        }

        // Giới hạn history để tránh quá tải token (Lấy 10 tin gần nhất)
        const limitedHistory = body.history?.slice(-10) || [];

        const answer = await this.aiService.chat(body.message, limitedHistory);
        return { answer };
    }
}
