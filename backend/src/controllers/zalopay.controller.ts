import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ZaloPayService } from '../services/zalopay.service';

@Controller('zalopay')
export class ZaloPayController {
    constructor(private readonly zaloPayService: ZaloPayService) { }

    @Post('create-order')
    async createOrder(@Body() body: { bookingId: number; amount: number; userEmail: string }) {
        return this.zaloPayService.createOrder(body.bookingId, body.amount, body.userEmail);
    }

    @Post('callback')
    async callback(@Body() body: any) {
        return this.zaloPayService.handleCallback(body);
    }

    @Get('query-status/:app_trans_id')
    async queryStatus(@Param('app_trans_id') app_trans_id: string) {
        return this.zaloPayService.queryStatus(app_trans_id);
    }
}
