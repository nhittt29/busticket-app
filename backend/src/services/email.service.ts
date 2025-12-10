// src/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // HÀM DUY NHẤT – GỬI EMAIL CHO TẤT CẢ TRƯỜNG HỢP (1 VÉ HOẶC NHIỀU VÉ)
  // DÙNG paymentHistoryId ĐỂ TẠO MÃ VÉ CHUNG → CHUẨN NHƯ API TRẢ VỀ
  async sendUnifiedTicketEmail(
    to: string,
    tickets: any[],                 // mảng vé (1 hoặc nhiều)
    paymentHistoryId: number,       // ← mã vé chung được sinh từ paymentHistory.id
    qrCodeUrl: string,
    paymentMethod: string = 'MoMo', // Default fallback
  ) {
    const userName = tickets[0]?.user?.name || 'Khách hàng';
    const startPoint = tickets[0]?.schedule?.route?.startPoint || 'Không xác định';
    const endPoint = tickets[0]?.schedule?.route?.endPoint || 'Không xác định';
    const busName = tickets[0]?.schedule?.bus?.name || 'Không xác định';
    const busPlate = tickets[0]?.schedule?.bus?.licensePlate || 'Không xác định';
    const departure = new Date(tickets[0]?.schedule?.departureAt).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // MÃ VÉ DUY NHẤT CHO TOÀN BỘ ĐƠN HÀNG – DÙNG paymentHistoryId
    const ticketCode = `V${String(paymentHistoryId).padStart(6, '0')}`;

    // Danh sách ghế
    const seatCodes = tickets
      .map((t: any) => t.seat?.code || 'N/A')
      .filter(Boolean)
      .join(', ');

    // Tổng tiền (dùng totalPrice nếu có, fallback về price + surcharge)
    const totalAmount = tickets.reduce((sum: number, t: any) => {
      return sum + (t.totalPrice ?? t.price ?? 0);
    }, 0);

    const ticketCount = tickets.length;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Vé xe ${ticketCode} - BusTicket</title>
<style>
  body { font-family: Arial, sans-serif; background:#f1f4f8; padding:0; margin:0; }
  .container { max-width:600px; margin:auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08); }
  .header { background:#1565c0; padding:25px; color:white; text-align:center; }
  .header h1{ margin:0; font-size:22px; font-weight:600; }
  .content { padding:22px; font-size:15px; color:#222; line-height:1.6; }
  .ticket-box{ background:#fafbff; border:1px solid #e1e6f0; padding:20px; border-radius:10px; margin-top:15px; }
  .ticket-header{ font-size:18px; font-weight:700; margin-bottom:10px; color:#1976d2; }
  .info-grid{ display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:12px; }
  .info-row{ margin-bottom:8px; }
  .label{ color:#666; font-size:14px; }
  .value{ color:#111; font-weight:600; margin-top:2px; font-size:15px; }
  .highlight-box{ background:#e8f2ff; padding:10px 14px; border-left:4px solid #1976d2; border-radius:6px; margin-bottom:12px; }
  .highlight-value{ font-size:16px; font-weight:700; }
  .qr{text-align:center;margin-top:22px;}
  .qr img{width:160px;height:160px;border-radius:8px;}
  .notice{background:#fff3cd;padding:14px;border-left:4px solid #ffca28;border-radius:8px;font-size:14px;margin-top:20px;}
  .footer{background:#0d47a1;color:white;text-align:center;padding:12px;font-size:13px;}
  @media(max-width:480px){ .info-grid{ grid-template-columns:1fr; } }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Đặt vé thành công</h1>
  </div>
  <p style="margin-top: 8px; font-size: 15px; color: #555; text-align: center;">
    Cảm ơn bạn đã tin tưởng BusTicket!
  </p>
  <div class="content">
    <p>Xin chào <strong>${userName}</strong>,</p>
    <p>Cảm ơn bạn đã đặt <strong>${ticketCount} vé</strong> cùng BusTicket. Dưới đây là thông tin chi tiết:</p>
    <div class="ticket-box">
      <div class="ticket-header">Mã vé: ${ticketCode}</div>
      <div class="highlight-box">
        <div class="label">Tuyến đường</div>
        <div class="highlight-value">${startPoint} → ${endPoint}</div>
      </div>
      <div class="highlight-box">
        <div class="label">Thời gian khởi hành</div>
        <div class="highlight-value">${departure}</div>
      </div>
      <div class="info-grid">
        <div>
          <div class="info-row">
            <div class="label">Số ghế</div>
            <div class="value">${seatCodes}</div>
          </div>
          <div class="info-row">
            <div class="label">Tổng tiền</div>
            <div class="value">${totalAmount.toLocaleString('vi-VN')}đ</div>
          </div>
        </div>
        <div>
          <div class="info-row">
            <div class="label">Nhà xe</div>
            <div class="value">${busName}</div>
          </div>
          <div class="info-row">
            <div class="label">Biển số xe</div>
            <div class="value">${busPlate}</div>
          </div>
          <div class="info-row">
            <div class="label">Thanh toán</div>
            <div class="value">${paymentMethod}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="qr">
      <p><strong>1 mã QR dùng chung cho ${ticketCount} ghế</strong></p>
      <img src="${qrCodeUrl}" alt="QR Code ${ticketCode}">
    </div>
    <div class="notice">
      Vui lòng có mặt tại bến trước <strong>30 phút</strong><br>
      Xuất trình <strong>mã vé ${ticketCode}</strong> hoặc QR code để lên xe<br>
      Chúc quý khách chuyến đi vui vẻ và an toàn!
    </div>
  </div>
  <div class="footer">
    © 2025 BusTicket.vn — Hỗ trợ: support@busticket.vn | 1900 1234
  </div>
</div>
</body>
</html>
`;

    try {
      await this.transporter.sendMail({
        from: '"BusTicket.vn" <no-reply@busticket.vn>',
        to,
        subject: `Xác nhận đặt vé thành công - Mã vé: ${ticketCode}`,
        html,
      });
      this.logger.log(`Email gửi thành công → ${to} | Mã vé: ${ticketCode} (${ticketCount} vé)`);
    } catch (error) {
      this.logger.error('Gửi email thất bại:', error);
      throw error;
    }
  }
}