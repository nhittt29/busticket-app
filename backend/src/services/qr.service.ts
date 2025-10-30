// src/services/qr.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor() {
    cloudinary.config();
    this.logger.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
  }

  async generateSecureTicketQR(ticketId: number): Promise<string> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (!process.env.FRONTEND_URL) {
        this.logger.warn('FRONTEND_URL not set → using fallback: http://localhost:3000');
      }

      const payload = { ticketId, iat: Math.floor(Date.now() / 1000) };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

      const verifyUrl = `${frontendUrl}/verify-qr?token=${token}`;
      this.logger.log(`QR URL: ${verifyUrl}`);

      const qrDataUrl = await QRCode.toDataURL(verifyUrl);

      const result = await cloudinary.uploader.upload(qrDataUrl, {
        folder: 'bus-tickets/qr',
        public_id: `ticket_${ticketId}_${Date.now()}`,
        overwrite: true,
        resource_type: 'image',
      });

      this.logger.log(`QR uploaded: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      this.logger.error('QR generation failed:', error);
      throw error;
    }
  }

  verifyToken(token: string): { ticketId: number } | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return { ticketId: decoded.ticketId };
    } catch (error) {
      this.logger.warn(`Invalid QR token: ${error.message}`);
      return null;
    }
  }
}