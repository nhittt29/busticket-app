// src/controllers/qr.controller.ts
import { Controller, Get, Post, Body, Query, BadRequestException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QrService } from '../services/qr.service';
import { PrismaService } from '../services/prisma.service';

import { NotificationService } from '../services/notification.service';

import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Controller('qr')
export class QrController {
  constructor(
    private readonly qrService: QrService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly httpService: HttpService,
  ) { }

  @Post('confirm')
  async confirmBoarding(@Body() body: { ticketId: number; image: string }) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: Number(body.ticketId) },
      include: { user: true }
    });

    if (!ticket) throw new BadRequestException('Vé không tồn tại');

    // 1. Verify with DeepFace (Python Service)
    if (!ticket.user.faceUrl) throw new BadRequestException('User chưa đăng ký FaceID');

    // Fix path resolution
    let facePath = ticket.user.faceUrl;
    if (facePath.startsWith('/')) facePath = facePath.substring(1); // Remove leading slash
    if (facePath.startsWith('\\')) facePath = facePath.substring(1);

    // Ensure we are pointing to d:\busticket-app\backend
    const absoluteFacePath = require('path').join(process.cwd(), facePath);
    try {
      console.log(`[DEEPFACE] Verifying... Ticket ${ticket.id}`);
      const response = await lastValueFrom(
        this.httpService.post('http://127.0.0.1:5000/verify', {
          img1: absoluteFacePath,
          img2: body.image, // Base64 from client
          model_name: "VGG-Face",
        })
      );

      const result = response.data;
      console.log('[DEEPFACE] Result:', result);

      if (!result.verified) {
        throw new BadRequestException('Khuôn mặt không khớp (AI Reject)');
      }

    } catch (error) {
      console.error('[DEEPFACE] Error:', error.message);
      if (error.response) console.error(error.response.data);
      throw new BadRequestException('Lỗi xác thực khuôn mặt: ' + (error.response?.data?.exception || error.message));
    }

    // 2. If Verified -> Create Notification
    await this.notificationService.create({
      userId: ticket.userId,
      title: 'Lên xe thành công! 🚌',
      message: `Hệ thống đã xác thực khuôn mặt của bạn cho vé #${ticket.id}. Chúc bạn ${ticket.user.name} có một chuyến đi vui vẻ và an toàn!`,
      type: 'TICKET'
    });

    console.log(`[BOARDING] Confirmed boarding for User ${ticket.userId} - Ticket ${ticket.id}`);
    return { success: true, message: 'Confirmed' };
  }

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
        schedule: {
          include: {
            route: true,
            bus: true,
          },
        },
        ticketPayments: {
          include: {
            payment: true, // paymentHistory thực ra là payment trong Prisma Client
          },
        },
      },
    });

    console.log(`[VERIFY-DEBUG] Found Ticket #${ticket?.id}, Status: ${ticket?.status}`);
    if (ticket) {
      console.log(`[VERIFY-DEBUG] Payments:`, JSON.stringify(ticket.ticketPayments));
    }

    if (!ticket) {
      throw new BadRequestException('Vé không tồn tại');
    }

    // CHECK VALIDITY: Either Status is PAID OR has a successful payment linked
    const isPaid = ticket.status === 'PAID' || ticket.ticketPayments.some(tp => tp.payment.status === 'SUCCESS' || tp.payment.status === 'COMPLETED');

    if (!isPaid) {
      console.log(`[VERIFY-FAILURE] Ticket ${ticket.id} is NOT PAID. Status: ${ticket.status}`);
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
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #CDEEF3, #DAF1DE); display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 420px; overflow: hidden; position: relative; }
          .header { background: #96DFD8; padding: 30px 20px; text-align: center; color: #004d40; }
          .header h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; font-weight: 500; }
          .content { padding: 25px; }
          .valid-badge { background: #D6E9AA; border-radius: 50px; padding: 12px 20px; text-align: center; margin-bottom: 20px; color: #33691e; }
          .valid-badge h2 { font-size: 22px; margin: 0; }
          .highlight { text-align: center; margin-bottom: 25px; color: #00796b; font-size: 18px; background: #CDEEF3; padding: 8px; border-radius: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
          .info-item { background: #DAF1DE; padding: 12px; border-radius: 12px; border: 1px solid #AEE6CB; }
          .info-item strong { display: block; color: #2e7d32; font-size: 12px; margin-bottom: 4px; text-transform: uppercase; }
          .info-item span { color: #1b5e20; font-weight: 600; font-size: 14px; }
          .action { margin-top: 25px; text-align: center; }
          .action p { font-size: 18px; font-weight: bold; color: #00695c; background: #85D4BE; display: inline-block; padding: 10px 25px; border-radius: 30px; margin: 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #555; padding-bottom: 20px; }
          
          /* Button Styles */
          #btn-verify { background: #85D4BE !important; color: #004d40 !important; font-weight: bold; box-shadow: 0 4px 10px rgba(133, 212, 190, 0.4); }
          #btn-verify:disabled { background: #ccc !important; color: #666 !important; box-shadow: none; }
          
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
                <span>${ticket.seat.seatNumber}</span>
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

            <!-- FACE ID SECTION -->
            <div style="margin-top: 30px; text-align: center; border-top: 2px dashed #eee; padding-top: 20px;">
              <h3 style="color: #43a047; margin-bottom: 15px;">XÁC THỰC KHUÔN MẶT (AI)</h3>
              
              <div id="loading-models" style="color: #666; font-style: italic; margin-bottom: 15px;">
                Đang tải bộ não AI... (Vui lòng đợi 3-5s)
              </div>
              
              <div id="verification-ui" style="display: none;">
                <!-- Result Message -->
                <div id="result-message" style="margin-bottom: 15px; font-weight: bold; font-size: 18px; display: none;"></div>

                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                  <!-- Registered Face (Hidden initially) -->
                  <div style="flex: 1; min-width: 140px; max-width: 180px;">
                    <p style="margin-bottom: 8px; color: #666; font-size: 14px; font-weight: bold;">Ảnh đăng ký</p>
                    <div id="registered-face-container" style="width: 140px; height: 140px; margin: 0 auto; padding: 4px; border: 3px solid #ccc; border-radius: 50%; overflow: hidden; position: relative;">
                         <!-- Image loaded but hidden/blurred initially -->
                         ${ticket.user.faceUrl
        ? `<img id="registered-img" 
                                   src="${ticket.user.faceUrl.startsWith('http') ? ticket.user.faceUrl : '/' + ticket.user.faceUrl.replace(/\\/g, '/')}" 
                                   crossorigin="anonymous"
                                   style="width: 100%; height: 100%; object-fit: cover; filter: blur(10px); transition: filter 0.5s;" 
                                   alt="FaceID">
                              <div id="lock-icon" style="position: absolute; top:0; left:0; width:100%; height:100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3);">
                                <span style="font-size: 30px;">🔒</span>
                              </div>`
        : `<div style="width: 100%; height: 100%; background: #f5f5f5; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 40px; color: #ccc;">?</span>
                              </div>`
      }
                    </div>
                  </div>

                  <!-- Live Camera -->
                  <div id="camera-container" style="flex: 1; min-width: 140px; max-width: 180px;">
                     <p style="margin-bottom: 8px; color: #666; font-size: 14px; font-weight: bold;">Camera xác thực</p>
                     <div style="width: 140px; height: 140px; margin: 0 auto; border: 3px solid #1976d2; border-radius: 50%; overflow: hidden; position: relative; background: #000;">
                        <video id="live-video" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
                     </div>
                  </div>
                </div>

                <!-- Action Button -->
                <div style="margin-top: 20px;">
                   <button id="btn-verify" onclick="startScanning()" disabled style="background: #ccc; color: white; border: none; padding: 12px 25px; border-radius: 25px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.3s;">
                      <span id="btn-text">Đang khởi động AI...</span>
                   </button>
                   <p id="error-msg" style="color: red; font-size: 13px; margin-top: 8px; display: none;"></p>
                </div>
              </div>

            </div>
            <!-- END FACE ID SECTION -->

          </div>
          
          <!-- LOAD FACE API -->
          <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
          <script>
            let stream = null;
            let modelsLoaded = false;
            let registeredDescriptor = null;
            // Public models URL
            const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

            let isScanning = false;
            
            function logToServer(message, type = 'INFO') {
              console.log(message);
              fetch('/api/qr/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type })
              }).catch(e => console.error('Log failed', e));
            }
            
            // Start Camera
            async function startCamera() {
               try {
                   const video = document.getElementById('live-video');
                   stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                   video.srcObject = stream;
                   
                   document.getElementById('loading-models').style.display = 'none';
                   document.getElementById('verification-ui').style.display = 'block';
                   
                   // Enable Button
                   const btn = document.getElementById('btn-verify');
                   btn.disabled = false;
                   btn.style.background = '#1976d2';
                   document.getElementById('btn-text').innerText = 'Bắt đầu Xác thực';
               } catch (err) {
                   logToServer('Lỗi mở Camera: ' + err.message, 'ERROR');
                   document.getElementById('loading-models').innerText = 'Lỗi Camera: ' + err.message;
               }
            }

            // Capture and Verify Loop
            async function startScanning() {
                if(isScanning) return;
                isScanning = true;
                
                const video = document.getElementById('live-video');
                const btn = document.getElementById('btn-verify');
                const btnText = document.getElementById('btn-text');
                
                // COUNTDOWN 3s
                for(let i = 3; i > 0; i--) {
                    btn.style.background = '#f57c00';
                    btnText.innerText = 'Giữ nguyên... ' + i + 's';
                    await new Promise(r => setTimeout(r, 1000));
                }
                
                // Wait for video to be ready
                if (video.readyState !== 4) {
                   await new Promise(r => setTimeout(r, 500));
                }

                // Loop
                while (true) {
                   if (!stream) break; // Stop if stream closed

                   try {
                       // 1. Capture & Resize
                       const canvas = document.createElement('canvas');
                       const MAX_WIDTH = 500; // Limit width to 500px for speed
                       const scale = MAX_WIDTH / video.videoWidth;
                       canvas.width = MAX_WIDTH;
                       canvas.height = video.videoHeight * scale;
                       
                       canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                       const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

                       // 2. Send to Server
                       btnText.innerText = 'Đang gửi AI (Python)...';
                       const res = await fetch('/api/qr/confirm', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ticketId: ${ticket.id}, image: imageBase64 })
                       });
                       const data = await res.json();
                       
                       if (data.success) {
                           logToServer('DeepFace Verified Success!', 'SUCCESS');
                           showSuccess();
                           break; // STOP LOOP
                       } else {
                           // Failed match
                           logToServer('DeepFace: Không khớp', 'WARN');
                           btnText.innerText = 'Không khớp. Thử lại...';
                           // Continue loop
                       }

                   } catch (e) {
                       console.error(e);
                       // 400 Bad Request usually means prediction failed
                   }
                   
                   // Wait 2 seconds before next try
                   await new Promise(r => setTimeout(r, 2000));
                }
            }
            
            function showSuccess() {
                // STOP STREAM
                 if (stream) {
                   stream.getTracks().forEach(track => track.stop());
                   stream = null;
                 }
                 
                 document.getElementById('btn-verify').style.display = 'none';
                 
                 // Show Full Screen Success Modal
                        const modal = document.createElement('div');
                        modal.id = 'success-modal';
                        modal.style.position = 'fixed';
                        modal.style.top = '0';
                        modal.style.left = '0';
                        modal.style.width = '100%';
                        modal.style.height = '100%';
                        modal.style.background = 'rgba(0,0,0,0.85)';
                        modal.style.zIndex = '9999';
                        modal.style.display = 'flex';
                        modal.style.alignItems = 'center';
                        modal.style.justifyContent = 'center';
                        modal.style.flexDirection = 'column';
                        modal.innerHTML = '<div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 90%; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">' +
                            '<div style="font-size: 60px; margin-bottom: 20px;">🎉🚍</div>' +
                            '<h2 style="color: #2e7d32; margin-bottom: 10px; font-size: 28px;">Lên xe thành công!</h2>' +
                            '<p style="font-size: 18px; color: #555; line-height: 1.5;">Chúc bạn <b>${ticket.user.name}</b><br>có một chuyến đi vui vẻ và thượng lộ bình an!</p>' +
                            '<button onclick="document.getElementById(\\'success-modal\\').remove()" style="margin-top: 25px; background: linear-gradient(135deg, #43a047, #66bb6a); color: white; border: none; padding: 12px 30px; font-size: 16px; border-radius: 50px; cursor: pointer; box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);">Đóng</button>' +
                            '</div>' +
                            '<style>@keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }</style>';
                        document.body.appendChild(modal);
            }

            // Init
            window.onload = startCamera;
          </script>
          
          <div class="footer">
            <p>BusTicket.vn - Hệ thống đặt vé xe thông minh</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  @Post('log')
  async logClient(@Body() body: { message: string, type?: string }) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[CLIENT-LOG] ${timestamp} - ${body.type || 'INFO'}: ${body.message}`);
    return { success: true };
  }

  @Get('generate')
  async generate(@Query('ticketId') ticketId: string) {
    const id = Number(ticketId);
    if (isNaN(id)) throw new BadRequestException('ticketId không hợp lệ');
    const qrCode = await this.qrService.generateSecureTicketQR(id);
    return { qrCode };
  }
}

