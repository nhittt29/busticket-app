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
    const busName = ticket.schedule?.bus?.name || 'Không xác định';
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
        body { font-family: Arial, sans-serif; background: #f1f4f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; }
        .header { background:#1976d2; padding:25px; color:#fff; text-align:center; }
        .header h1 { margin:0; font-size:24px; }
        .header p { margin:5px 0 0; opacity:.9; }

        .content { padding:25px; font-size:15px; color:#333; }
        .ticket-box { border:1px dashed #cfd8dc; padding:20px; border-radius:8px; margin-top:15px; }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-top:15px;
          border-top: 1px solid #e0e0e0;
          padding-top: 12px;
        }

        .col div { margin-bottom: 10px; line-height: 1.5; }

        .label { color:#555; font-weight:600; font-size:14px; display:block; margin-bottom:2px; }
        .value { color:#000; font-weight:500; }

        .qr { text-align:center; margin-top:25px; }
        .qr img { width:160px; height:160px; border-radius:10px; }

        .notice { background:#fff3cd; padding:15px; border-left:4px solid #ffca28; border-radius:6px; font-size:14px; margin-top:20px; }

        .footer { background:#1565c0; padding:18px; text-align:center; color:#fff; font-size:13px; }
        .footer a { color:#bbdefb; text-decoration:none; }

        @media(max-width:480px){
          .row { grid-template-columns:1fr; }
        }
      </style>
    </head>

    <body>
    <div class="container">

      <div class="header">
        <h1>Thanh toán thành công ✅</h1>
        <p>Vé xe của bạn đã được xác nhận</p>
      </div>

      <div class="content">
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Cảm ơn bạn đã đặt vé cùng BusTicket. Thông tin vé của bạn như sau:</p>

        <div class="ticket-box">
          <div style="margin-bottom:8px;">
            <span class="label">Mã vé:</span>
            <span class="value">#${ticket.id}</span>
          </div>

          <div class="row">
            <!-- Cột trái -->
            <div class="col">
              <div>
                <span class="label">Tuyến:</span>
                <span class="value">${startPoint} → ${endPoint}</span>
              </div>
              <div>
                <span class="label">Số ghế:</span>
                <span class="value">${seatCode}</span>
              </div>
              <div>
                <span class="label">Giá vé:</span>
                <span class="value">${ticket.price.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <!-- Cột phải -->
            <div class="col">
              <div>
                <span class="label">Khởi hành:</span>
                <span class="value">lúc ${departure}</span>
              </div>
              <div>
                <span class="label">Xe:</span>
                <span class="value">${busName}</span>
              </div>
              <div>
                <span class="label">Thanh toán:</span>
                <span class="value">MoMo</span>
              </div>
            </div>
          </div>
        </div>

        <div class="qr">
          <p><strong>Quét mã QR khi lên xe</strong></p>
          <img src="${qrCodeUrl}" alt="QR Code Ticket #${ticket.id}">
        </div>

        <div class="notice">
          ⚠️ Lưu ý:<br>
          • Có mặt trước giờ khởi hành <strong>30 phút</strong><br>
          • Xuất trình mã QR để lên xe<br>
          • Chúc bạn có chuyến đi an toàn & thoải mái!
        </div>
      </div>

      <div class="footer">
        © 2025 BusTicket.vn — Đặt vé xe liên tỉnh nhanh chóng  
        <br>Hỗ trợ: <a href="mailto:support@busticket.vn">support@busticket.vn</a> | 1900 1234
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
