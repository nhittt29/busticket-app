
import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { VnPayService } from '../services/vnpay.service';
import { TicketService } from '../services/ticket.service';
import { PaymentMethod } from '../models/Ticket';

@Controller('vnpay')
export class VnPayController {
    private readonly logger = new Logger(VnPayController.name);

    constructor(
        private readonly vnpayService: VnPayService,
        private readonly ticketService: TicketService,
    ) { }

    @Get('return')
    async vnpayReturn(@Query() query: any, @Res() res: Response) {
        this.logger.log(`VNPAY Return: ${JSON.stringify(query)}`);
        const verify = this.vnpayService.verifyReturnUrl(query);

        if (verify.success && verify.paymentHistoryId) {
            // Xác nhận thanh toán thành công trong DTB (nếu chưa)
            try {
                await this.ticketService.payTicket(
                    verify.paymentHistoryId,
                    PaymentMethod.VNPAY,
                    query['vnp_TransactionNo']
                );
                // Redirect về DeepLink App
                return res.redirect(`busticket://payment-success?orderId=${query['vnp_TxnRef']}`);
            } catch (e) {
                this.logger.error('PayTicket Failed:', e);
                return res.status(400).json({ message: 'Payment processing failed' });
            }
        } else {
            return res.status(400).json({ message: 'Payment Failed or Invalid Signature', detail: verify.message });
        }
    }

    @Get('ipn')
    async vnpayIpn(@Query() query: any, @Res() res: Response) {
        this.logger.log(`VNPAY IPN: ${JSON.stringify(query)}`);
        const verify = this.vnpayService.verifyReturnUrl(query); // Reuse logic verify signature

        if (verify.success && verify.paymentHistoryId) {
            try {
                // Double check status in DB before update to avoid duplicates
                // TicketService.payTicket handles "Already Paid" check internally securely
                await this.ticketService.payTicket(
                    verify.paymentHistoryId,
                    PaymentMethod.VNPAY,
                    query['vnp_TransactionNo']
                );
                return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
            } catch (e) {
                // Nếu đã thanh toán rồi thì vẫn trả về 00 Success cho VNPAY đỡ retry
                if (e.message.includes('Đơn đã được thanh toán')) {
                    return res.status(200).json({ RspCode: '00', Message: 'Order already confirmed' });
                }
                this.logger.error('IPN processing error', e);
                return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
            }
        } else {
            return res.status(200).json({ RspCode: '97', Message: 'Invalid Signature' });
        }
    }
}
