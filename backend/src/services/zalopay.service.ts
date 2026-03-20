import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { TicketService } from './ticket.service';

@Injectable()
export class ZaloPayService {
    private readonly logger = new Logger(ZaloPayService.name);

    private get config() {
        return {
            app_id: process.env.ZALO_APP_ID || '2554',
            key1: process.env.ZALO_KEY1 || 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
            key2: process.env.ZALO_KEY2 || 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
            endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
            query_endpoint: 'https://sb-openapi.zalopay.vn/v2/query',
            callback_url: process.env.ZALO_CALLBACK_URL,
        };
    }

    constructor(
        private paymentHistoryRepo: PaymentHistoryRepository,
        @Inject(forwardRef(() => TicketService)) private ticketService: TicketService
    ) { }

    async createOrder(bookingId: number, amount: number, userEmail: string, host?: string) {
        const backendUrl = host ? `http://${host}` : (process.env.BACKEND_URL || 'http://localhost:4000');
        const embed_data = {
            redirecturl: `${backendUrl}/api/tickets/zalopay/redirect`,
        };

        const items = [{ bookingId, userEmail }];
        const transID = Math.floor(Math.random() * 1000000);

        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd = now.getDate().toString().padStart(2, '0');
        const yymmdd = `${yy}${mm}${dd}`;

        const order = {
            app_id: this.config.app_id,
            app_trans_id: `${yymmdd}_${transID}`,
            app_user: userEmail || 'demo_user',
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            description: `Busticket - Payment for Ticket #${bookingId}`,
            bank_code: '',
            mac: '',
            callback_url: this.config.callback_url,
        };
        this.logger.log(`Creating ZaloPay Order with Callback URL: ${order.callback_url}`);

        const data =
            this.config.app_id +
            '|' +
            order.app_trans_id +
            '|' +
            order.app_user +
            '|' +
            order.amount +
            '|' +
            order.app_time +
            '|' +
            order.embed_data +
            '|' +
            order.item;

        order.mac = crypto.createHmac('sha256', this.config.key1).update(data).digest('hex');

        try {
            this.logger.log(`Creating ZaloPay Order: ${order.app_trans_id}`);
            const params = new URLSearchParams();
            Object.keys(order).forEach(key => params.append(key, order[key]));

            const result = await axios.post<any>(this.config.endpoint, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (result.data.return_code === 1) {
                await this.paymentHistoryRepo.update(bookingId, {
                    method: 'ZALOPAY',
                    transactionId: order.app_trans_id,
                    payUrl: result.data.order_url,
                });
            }
            return result.data;
        } catch (error) {
            this.logger.error('ZaloPay Create Order Failed', error);
            throw error;
        }
    }

    async handleCallback(body: any) {
        const { data: dataStr, mac: reqMac } = body;
        const mac = crypto.createHmac('sha256', this.config.key2).update(dataStr).digest('hex');

        if (reqMac !== mac) {
            this.logger.error('❌ MAC VALIDATION FAILED');
            return { return_code: -1, return_message: 'mac not equal' };
        } else {
            const dataJson = JSON.parse(dataStr);
            const conversionId = dataJson['app_trans_id'];

            try {
                const payment = await this.paymentHistoryRepo.findByTransactionId(conversionId);
                if (payment) {
                    await this.ticketService.payTicket(payment.id, 'ZALOPAY' as any, conversionId);
                } else {
                    this.logger.error(`Payment not found for TransID: ${conversionId}`);
                }
            } catch (e) {
                this.logger.error('Error in TicketService.payTicket', e);
            }
            return { return_code: 1, return_message: 'success' };
        }
    }

    async queryStatus(app_trans_id: string) {
        const params = {
            app_id: this.config.app_id,
            app_trans_id: app_trans_id,
            mac: '',
        };

        const data = this.config.app_id + '|' + params.app_trans_id + '|' + this.config.key1;
        params.mac = crypto.createHmac('sha256', this.config.key1).update(data).digest('hex');

        try {
            const result = await axios.post(this.config.query_endpoint, null, {
                params: params,
            });
            this.logger.log(`ZaloPay Query Result: ${JSON.stringify(result.data)}`);
            return result.data;
        } catch (error) {
            this.logger.error(`ZaloPay Query Failed: ${error.message}`);
            return { return_code: -1, return_message: 'Query Failed' };
        }
    }
}
