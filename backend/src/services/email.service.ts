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

  async sendTicketEmail(to: string, ticket: any, qrCodeUrl: string) {
    const userName = ticket.user?.name || 'Khách hàng';
    const startPoint = ticket.schedule?.route?.startPoint || 'Không xác định';
    const endPoint = ticket.schedule?.route?.endPoint || 'Không xác định';

    // Lấy thông tin xe
    const bus = ticket.schedule?.bus;
    const busName = bus?.name || 'Không xác định';
    const busPlate = bus?.licensePlate || 'Không xác định';

    const seatCode = ticket.seat?.code || 'N/A';

    const departure = new Date(ticket.schedule.departureAt).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Vé xe #${ticket.id} - BusTicket</title>
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
  <div class="header"><h1>Vé xe điện tử – Xác nhận thành công ✅</h1></div>

  <div class="content">
    <p>Xin chào <strong>${userName}</strong>,</p>
    <p>Cảm ơn bạn đã đặt vé cùng BusTicket. Dưới đây là thông tin vé của bạn:</p>

    <div class="ticket-box">
      <div class="ticket-header">🎫 Mã vé: #${ticket.id}</div>

      <div class="highlight-box">
        <div class="label">Tuyến</div>
        <div class="highlight-value">${startPoint} → ${endPoint}</div>
      </div>

      <div class="highlight-box">
        <div class="label">Khởi hành</div>
        <div class="highlight-value">⏰ ${departure}</div>
      </div>

      <div class="info-grid">

        <div>
          <div class="info-row">
            <div class="label">Số ghế</div>
            <div class="value">${seatCode}</div>
          </div>

          <div class="info-row">
            <div class="label">Giá vé</div>
            <div class="value">${ticket.price.toLocaleString('vi-VN')}đ</div>
          </div>
        </div>

        <div>
          <div class="info-row">
            <div class="label">Xe</div>
            <div class="value">${busName}</div>
          </div>

          <div class="info-row">
            <div class="label">Biển số</div>
            <div class="value">${busPlate}</div>
          </div>

          <div class="info-row">
            <div class="label">Thanh toán</div>
            <div class="value">MoMo</div>
          </div>
        </div>

      </div>
    </div>

    <div class="qr">
      <p><strong>Quét mã QR khi lên xe</strong></p>
      <img src="${qrCodeUrl}" alt="QR Code Ticket #${ticket.id}">
    </div>

    <div class="notice">
      ⚠️ Vui lòng có mặt trước <strong>30 phút</strong><br>
      Xuất trình mã QR để lên xe<br>
      Chúc bạn có chuyến đi vui vẻ!
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
        subject: `Vé xe #${ticket.id} – Thanh toán thành công`,
        html,
      });
      this.logger.log(`Email gửi thành công đến: ${to}`);
    } catch (error) {
      this.logger.error(`Gửi email thất bại:`, error);
      throw error;
    }
  }
}
