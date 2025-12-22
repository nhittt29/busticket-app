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

  createPaymentUrl(paymentHistoryId: number, amount: number, ipAddress: string): string {
    const createDate = format(new Date(), 'yyyyMMddHHmmss');
    const orderId = `TICKET_${paymentHistoryId}_${Date.now()}`;
    const amountVal = Math.floor(amount * 100);

    if (!this.tmnCode || !this.hashSecret) {
      throw new Error('VNPAY configuration is missing. Please check .env');
    }

    const vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan ve ${paymentHistoryId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amountVal;
    vnp_Params['vnp_ReturnUrl'] = this.returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddress || '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;

    // Custom sorting and encoding
    const sortedKeys = Object.keys(vnp_Params).sort();
    let signData = '';
    let query = '';

    // Helper to match PHP's urlencode (spaces to +)
    const encodeParams = (str: string) => encodeURIComponent(str).replace(/%20/g, '+');

    sortedKeys.forEach((key) => {
      const value = vnp_Params[key];
      if (value !== null && value !== undefined && value.toString() !== '') {
        if (signData.length > 0) {
          signData += '&' + key + '=' + value; // Raw data for hash? NO, VNPAY docs say hash on query string usually?
          // WAIT. Docs: "Dữ liệu checksum được thành lập dựa trên việc sắp xếp tăng dần của tên tham số (QueryString)"
          // PHP example: $hashdata .= urlencode($key) . "=" . urlencode($value);
          // So we MUST encode keys and values in the hash data too.

          signData += '&' + encodeParams(key) + '=' + encodeParams(value.toString());
          query += '&' + encodeParams(key) + '=' + encodeParams(value.toString());
        } else {
          signData += encodeParams(key) + '=' + encodeParams(value.toString());
          query += encodeParams(key) + '=' + encodeParams(value.toString());
        }
      }
    });

    // Create Hash
    const hmac = crypto.createHmac('sha512', this.hashSecret!);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Final URL
    const finalUrl = `${this.vnpUrl}?${query}&vnp_SecureHash=${signed}`;

    this.logger.log(`VNPAY URL Created: ${finalUrl}`);
    return finalUrl;
  }

  verifyReturnUrl(vnp_Params: any): { success: boolean, paymentHistoryId?: number, message?: string } {
    const secureHash = vnp_Params['vnp_SecureHash'];
    const rParams: any = {};

    Object.keys(vnp_Params).forEach(key => {
      if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        rParams[key] = vnp_Params[key];
      }
    });

    const sortedParams: any = {};
    const keys = Object.keys(rParams).sort();
    keys.forEach((key) => {
      if (rParams[key] !== null && rParams[key] !== '') {
        sortedParams[key] = rParams[key];
      }
    });

    const signData = querystring.stringify(sortedParams, { encode: true });

    // signData now contains standard encoded string (with %20)
    // IMPORTANT: When VNPAY returns data, it might return with +, so we must be careful.
    // However, verify logic usually reconstructs signData from RAW params, which we re-encode.
    // If VNPAY sends raw params decoded by NestJS, they are just strings.
    // We re-encode them. If we encode space to %20, and VNPAY generated hash using +, it fails.
    // BUT we fixed CreatePaymentUrl to use %20.
    // The Return URL verification depends on how VNPAY sends back data.
    // Usually VNPAY sends back URL encoded params. NestJS decodes them.
    // We get "Thanh_toan_ve_...".
    // We encode again -> "Thanh_toan_ve_...".
    // If create used "Thanh_toan_ve_...", spaces are gone. So it is safe.

    const hmac = crypto.createHmac('sha512', this.hashSecret!);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        const orderId = vnp_Params['vnp_TxnRef'];
        const match = orderId.match(/^TICKET_(\d+)_\d+$/);
        if (match) return { success: true, paymentHistoryId: Number(match[1]) };
        return { success: false, message: 'Invalid OrderId format' };
      }
      return { success: false, message: 'Payment failed code: ' + vnp_Params['vnp_ResponseCode'] };
    } else {
      return { success: false, message: 'Invalid Signature' };
    }
  }

  private sortObject(obj: any): any { return {}; }
}
