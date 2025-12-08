import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from './prisma.service';
import { PaymentMethod, TicketStatus } from '@prisma/client';

@Injectable()
export class ZaloPayService {
    private readonly logger = new Logger(ZaloPayService.name);

    // SANBOX CREDENTIALS (FOR TEST ONLY)
    private readonly config = {
        app_id: '2554',
        key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
        key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
        endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
        query_endpoint: 'https://sb-openapi.zalopay.vn/v2/query',
    };

    constructor(private prisma: PrismaService) { }

    /**
     * Create ZaloPay Order
     * @param bookingId - The ID of the booking/ticket
     * @param amount - Amount to pay
     * @param userEmail - User's email for identifying
     */
    async createOrder(bookingId: number, amount: number, userEmail: string) {
        const embed_data = {
            redirecturl: 'https://busticket-app.demo/payment-result', // Deep link or Web URL
        };

        const items = [{ bookingId, userEmail }];
        const transID = Math.floor(Math.random() * 1000000);

        // Format YYMMDD using native Date
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd = now.getDate().toString().padStart(2, '0');
        const yymmdd = `${yy}${mm}${dd}`;

        const order = {
            app_id: this.config.app_id,
            app_trans_id: `${yymmdd}_${transID}`, // format: yyMMdd_xxxx
            app_user: userEmail || 'demo_user',
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            description: `Busticket - Payment for Ticket #${bookingId}`,
            bank_code: '',
            mac: '',
            callback_url: 'https://faxqg-2405-4803-b186-99f0-dc2d-2b09-4ed9-4450.a.free.pinggy.link/api/zalopay/callback',
        };

        // app_id|app_trans_id|app_user|amount|app_time|embed_data|item
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

        order.mac = crypto
            .createHmac('sha256', this.config.key1)
            .update(data)
            .digest('hex');

        try {
            this.logger.log(`Creating ZaloPay Order: ${order.app_trans_id}`);
            const params = new URLSearchParams();
            Object.keys(order).forEach(key => params.append(key, order[key]));

            const result = await axios.post<any>(this.config.endpoint, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            this.logger.log(`ZaloPay Response: ${JSON.stringify(result.data)}`);

            if (result.data.return_code === 1) {
                // Save Transaction ID to Database
                await this.prisma.paymentHistory.create({
                    data: {
                        method: PaymentMethod.ZALOPAY,
                        amount: amount,
                        transactionId: order.app_trans_id, // Save ZaloPay Trans ID
                        ticketCode: bookingId.toString(), // Linking to ticket
                        status: 'PENDING',
                        payUrl: result.data.order_url,
                    },
                });
            }

            return result.data;
        } catch (error) {
            this.logger.error('ZaloPay Create Order Failed', error);
            throw error;
        }
    }

    /**
     * Handle Callback from ZaloPay Server
     */
    async handleCallback(body: any) {
        const { data: dataStr, mac: reqMac } = body;

        const mac = crypto
            .createHmac('sha256', this.config.key2)
            .update(dataStr)
            .digest('hex');

        this.logger.log(`Received Callback. Calc Mac: ${mac}, Req Mac: ${reqMac}`);

        if (reqMac !== mac) {
            // callback không hợp lệ
            return { return_code: -1, return_message: 'mac not equal' };
        } else {
            // thanh toán thành công
            // merchant cập nhật trạng thái đơn hàng
            const dataJson = JSON.parse(dataStr);
            this.logger.log(
                `Update Order Status success for TransID: ${dataJson['app_trans_id']}`,
            );

            // --- DB UPDATE LOGIC MUST BE HERE ---
            // Find the PaymentHistory by transactionId
            const conversionId = dataJson['app_trans_id'];

            try {
                const payment = await this.prisma.paymentHistory.findFirst({
                    where: { transactionId: conversionId }
                });

                if (payment && payment.ticketCode) {
                    // Update Payment Status
                    await this.prisma.paymentHistory.update({
                        where: { id: payment.id },
                        data: { status: 'SUCCESS', paidAt: new Date() }
                    });

                    // Update Ticket Status (Assumes ticketCode is Ticket ID)
                    const ticketId = parseInt(payment.ticketCode);
                    await this.prisma.ticket.update({
                        where: { id: ticketId },
                        data: { status: TicketStatus.PAID }
                    });
                }
            } catch (e) {
                this.logger.error('Error updating DB in callback', e)
            }

            return { return_code: 1, return_message: 'success' };
        }
    }

    /**
     * Query Status Order
     */
    async queryStatus(app_trans_id: string) {
        const postData = {
            app_id: this.config.app_id,
            app_trans_id: app_trans_id,
            mac: '',
        };

        const data =
            this.config.app_id + '|' + postData.app_trans_id + '|' + this.config.key1;

        postData.mac = crypto
            .createHmac('sha256', this.config.key1)
            .update(data)
            .digest('hex');

        try {
            const result = await axios.post(this.config.query_endpoint, null, {
                params: postData,
            });
            return result.data;
        } catch (error) {
            this.logger.error('Query Failed', error);
            throw error;
        }
    }
}
