import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

export interface MomoResponse {
  payUrl?: string;
  deeplink?: string;
  resultCode?: number;
  message?: string;
  [key: string]: any;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  private readonly endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

  private readonly partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
  private readonly accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
  private readonly secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

  /**
   * ✅ 1. Tạo yêu cầu thanh toán MoMo
   */
  async createPayment(ticketId: number, amount: number): Promise<MomoResponse> {
    const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/momo/redirect';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:3000/api/tickets/momo/callback';

    const requestId = `${this.partnerCode}${Date.now()}`;
    const orderId = `${ticketId}_${Date.now()}`;
    const orderInfo = `Thanh toan ve xe #${ticketId}`;

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');

    const payload = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType: 'captureWallet',
      extraData: '',
      signature,
      lang: 'vi',
      expiry: 900, // ✅ 15 phút
    };

    this.logger.debug(`📤 Payload gửi đến MoMo:\n${JSON.stringify(payload, null, 2)}`);

    const res = await axios.post<MomoResponse>(this.endpoint, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const momoResponse = res.data;
    this.logger.log(`🔗 MoMo response cho vé #${ticketId}: ${JSON.stringify(momoResponse)}`);

    return momoResponse;
  }

  /**
   * ✅ 2. Xác minh chữ ký callback từ MoMo
   */
  verifySignature(data: any): boolean {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = data;

      const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      const computedSignature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');

      const isValid = computedSignature === signature;
      if (!isValid) {
        this.logger.warn('⚠️ Chữ ký MoMo không hợp lệ!');
      }
      return isValid;
    } catch (err) {
      this.logger.error('❌ Lỗi khi xác minh chữ ký MoMo', err);
      return false;
    }
  }
}