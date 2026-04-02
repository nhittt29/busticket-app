import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { format } from 'date-fns';

@Injectable()
export class VnPayService {
  private readonly logger = new Logger(VnPayService.name);

  private tmnCode: string;
  private hashSecret: string;
  private vnpUrl: string;
  private returnUrl: string;

  constructor(private configService: ConfigService) {
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE', '').trim();
    this.hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', '').trim();
    this.vnpUrl = this.configService.get<string>('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html').trim();
    this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL', '').trim();

    if (!this.tmnCode || !this.hashSecret) {
      this.logger.error('Missing VNPAY_TMN_CODE or VNPAY_HASH_SECRET in .env');
      // We don't throw here to avoid crashing the app on startup, but payment will fail.
      // Alternatively, we can verify this inside createPaymentUrl
    }
  }

  createPaymentUrl(paymentHistoryId: number, amount: number, ipAddress: string, host?: string): string {
    const returnUrl = host 
      ? `http://${host}/api/vnpay/return` 
      : this.returnUrl;
    const createDate = format(new Date(), 'yyyyMMddHHmmss');
    const orderId = `TICKET_${paymentHistoryId}_${Date.now()}`;
    const amountVal = Math.floor(amount * 100);

    if (!this.tmnCode || !this.hashSecret) {
      throw new Error('VNPAY configuration is missing. Please check .env');
    }

    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan ve ${paymentHistoryId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amountVal;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddress || '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = this.sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.hashSecret!);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    const finalUrl = `${this.vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;
    
    this.logger.log(`VNPAY URL Created: ${finalUrl}`);
    return finalUrl;
  }

  verifyReturnUrl(vnp_Params: any): { success: boolean, paymentHistoryId?: number, message?: string } {
    const secureHash = vnp_Params['vnp_SecureHash'];

    let vnp_Params_clone = { ...vnp_Params };
    delete vnp_Params_clone['vnp_SecureHash'];
    delete vnp_Params_clone['vnp_SecureHashType'];

    vnp_Params_clone = this.sortObject(vnp_Params_clone);
    
    const signData = querystring.stringify(vnp_Params_clone, { encode: false });
    const hmac = crypto.createHmac('sha512', this.hashSecret!);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      if (vnp_Params['vnp_ResponseCode'] === '00' || vnp_Params['vnp_ResponseCode'] === '24') {
        const orderId = vnp_Params['vnp_TxnRef'];
        const match = orderId.match(/^TICKET_(\d+)_\d+$/);
        if (match) return { success: true, paymentHistoryId: Number(match[1]) };
        return { success: false, message: 'Invalid OrderId format' };
      }
      return { success: false, message: 'Payment failed code: ' + vnp_Params['vnp_ResponseCode'] };
    } else {
      this.logger.error(`VNPAY Signature Mismatch. Expected: ${signed}, Received: ${secureHash}`);
      return { success: false, message: 'Invalid Signature' };
    }
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const str: string[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
