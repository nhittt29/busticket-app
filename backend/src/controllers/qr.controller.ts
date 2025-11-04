// src/controllers/qr.controller.ts
import { Controller, Get, Query, BadRequestException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QrService } from '../services/qr.service';
import { PrismaService } from '../services/prisma.service';

@Controller('qr')
export class QrController {
  constructor(
    private readonly qrService: QrService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('verify')
  async verify(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new BadRequestException('Token không hợp lệ');

    const payload = this.qrService.verifyToken(token);
    if (!payload) throw new BadRequestException('QR không hợp lệ hoặc đã hết hạn');

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: payload.ticketId },
      include: {
        user: true,
        seat: true,
        schedule: { include: { route: true, bus: true } },
        payment: true,
      },
    });

    if (!ticket || ticket.status !== 'PAID') {
      throw new BadRequestException('Vé không hợp lệ hoặc chưa thanh toán');
    }

    const departure = new Date(ticket.schedule.departureAt).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Xác nhận vé #${ticket.id}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Roboto', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
          .card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); max-width: 420px; width: 100%; animation: slideUp 0.6s ease-out; }
          @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .header { background: linear-gradient(135deg, #43a047, #66bb6a); padding: 25px; text-align: center; color: white; position: relative; }
          .header::after { content: ''; position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-top: 20px solid #43a047; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .header p { font-size: 16px; opacity: 0.9; }
          .content { padding: 30px 25px 25px; }
          .valid-badge { background: #e8f5e8; border: 2px solid #4caf50; border-radius: 50px; padding: 12px 20px; text-align: center; margin-bottom: 20px; }
          .valid-badge h2 { color: #2e7d32; font-size: 24px; margin: 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
          .info-item { background: #f8f9fa; padding: 12px; border-radius: 10px; }
          .info-item strong { display: block; color: #424242; font-size: 13px; margin-bottom: 4px; }
          .info-item span { color: #212121; font-weight: 500; }
          .highlight { background: linear-gradient(135deg, #fff176, #ffd54f); padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0; }
          .highlight strong { color: #5d4037; font-size: 18px; }
          .action { text-align: center; margin-top: 25px; }
          .action p { background: #e8f5e8; color: #2e7d32; padding: 16px; border-radius: 12px; font-weight: 700; font-size: 20px; border: 3px solid #4caf50; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 13px; color: #666; }
          @media (max-width: 480px) {
            .info-grid { grid-template-columns: 1fr; }
            .card { margin: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>VÉ HỢP LỆ</h1>
            <p>Đã xác nhận thành công</p>
          </div>
          
          <div class="content">
            <div class="valid-badge">
              <h2>CHO PHÉP LÊN XE</h2>
            </div>
            
            <div class="highlight">
              <strong>Mã vé: #${ticket.id}</strong>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <strong>Hành khách</strong>
                <span>${ticket.user.name}</span>
              </div>
              <div class="info-item">
                <strong>Số ghế</strong>
                <span>${ticket.seat.code}</span>
              </div>
              <div class="info-item">
                <strong>Tuyến xe</strong>
                <span>${ticket.schedule.route.startPoint} → ${ticket.schedule.route.endPoint}</span>
              </div>
              <div class="info-item">
                <strong>Khởi hành</strong>
                <span>${departure}</span>
              </div>
              <div class="info-item">
                <strong>Biển số</strong>
                <span>${ticket.schedule.bus.name}</span>
              </div>
              <div class="info-item">
                <strong>Giá vé</strong>
                <span>${ticket.price.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            
            <div class="action">
              <p>CHO PHÉP LÊN XE</p>
            </div>
          </div>
          
          <div class="footer">
            <p>BusTicket.vn - Hệ thống đặt vé xe thông minh</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  @Get('generate')
  async generate(@Query('ticketId') ticketId: string) {
    const id = Number(ticketId);
    if (isNaN(id)) throw new BadRequestException('ticketId không hợp lệ');
    const qrCode = await this.qrService.generateSecureTicketQR(id);
    return { qrCode };
  }
}