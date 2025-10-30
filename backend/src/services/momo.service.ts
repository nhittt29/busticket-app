// src/services/momo.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

export interface MomoResponse {
  payUrl: string;
  resultCode: number;
  message?: string;
  [key: string]: any;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  private readonly endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

  private readonly partnerCode = process.env.MOMO_PARTNER_CODE!;
  private readonly accessKey = process.env.MOMO_ACCESS_KEY!;
  private readonly secretKey = process.env.MOMO_SECRET_KEY!;

  async createPayment(ticketId: number, realPrice: number): Promise<MomoResponse> {
    const redirectUrl = process.env.MOMO_REDIRECT_URL!;
    const ipnUrl = process.env.MOMO_IPN_URL!;

    const requestId = `${this.partnerCode}${Date.now()}`;
    const orderId = `TICKET_${ticketId}_${Date.now()}`;

    const amount = realPrice.toString();
    const displayPrice = realPrice.toLocaleString('vi-VN');
    const orderInfo = `Thanh toán vé xe #${ticketId} - ${displayPrice}đ`;

    const requestType = 'payWithMethod';
    const paymentCode = this.getTestPaymentCode();

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');

    const payload = {
      partnerCode: this.partnerCode,
      partnerName: 'BusTicket',
      storeId: 'BusTicketStore',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData: '',
      paymentCode,
      signature,
    };

    this.logger.debug(`Payload gửi MoMo:\n${JSON.stringify(payload, null, 2)}`);

    const res = await axios.post<MomoResponse>(this.endpoint, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    this.logger.log(`MoMo response: ${JSON.stringify(res.data)}`);
    return res.data;
  }

  private getTestPaymentCode(): string {
    return 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
  }

  verifySignature(data: any): boolean {
    if (process.env.MOMO_ENV === 'sandbox') return true;

    try {
      const {
        partnerCode, orderId, requestId, amount, orderInfo, orderType,
        transId, resultCode, message, payType, responseTime, extraData, signature
      } = data;

      const raw = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      const computed = crypto.createHmac('sha256', this.secretKey).update(raw).digest('hex');
      return computed === signature;
    } catch (err) {
      this.logger.error('Lỗi xác minh chữ ký', err);
      return false;
    }
  }
}