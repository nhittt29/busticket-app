// src/controllers/qr.controller.ts
import { Controller, Get, Post, Body, Query, BadRequestException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QrService } from '../services/qr.service';
import { PrismaService } from '../services/prisma.service';

import { NotificationService } from '../services/notification.service';

@Controller('qr')
export class QrController {
  constructor(
    private readonly qrService: QrService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) { }

  @Post('confirm')
  async confirmBoarding(@Body() body: { ticketId: number }) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: Number(body.ticketId) },
      include: { user: true }
    });

    if (!ticket) throw new BadRequestException('Vé không tồn tại');

    // Create Notification
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
                   <button id="btn-verify" onclick="startVerification()" disabled style="background: #ccc; color: white; border: none; padding: 12px 25px; border-radius: 25px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.3s;">
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

            function logToServer(message, type = 'INFO') {
              console.log(message); // Log to browser console too
              fetch('/api/qr/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type })
              }).catch(e => console.error('Log failed', e));
            }
            
            function confirmBoarding() {
               fetch('/api/qr/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: ${ticket.id} })
              }).then(res => res.json())
                .then(data => {
                   logToServer('Đã gửi thông báo xác thực thành công cho User', 'SUCCESS');
                })
                .catch(e => console.error('Confirm failed', e));
            }

            async function loadModels() {
              try {
                logToServer('Bắt đầu tải Model AI...', 'SYSTEM');
                await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                modelsLoaded = true;
                logToServer('Tải Model AI thành công!', 'SUCCESS');
                
                document.getElementById('loading-models').style.display = 'none';
                document.getElementById('verification-ui').style.display = 'block';
                
                // Active button
                const btn = document.getElementById('btn-verify');
                btn.style.background = '#1976d2';
                btn.disabled = false;
                document.getElementById('btn-text').innerText = 'Bắt đầu Quét & So Sánh';

                // Pre-process registered image
                processRegisteredImage();
              } catch (err) {
                console.error(err);
                logToServer('Lỗi tải Model AI: ' + err.message, 'ERROR');
                document.getElementById('loading-models').innerText = 'Lỗi tải AI: ' + err.message;
              }
            }

            async function processRegisteredImage() {
              const img = document.getElementById('registered-img');
              if (!img) {
                logToServer('Không tìm thấy ảnh đăng ký (User chưa có ảnh)', 'WARN');
                return;
              }
              
              // Wait for image to be fully loaded
              if (!img.complete || img.naturalHeight === 0) {
                 await new Promise(r => img.onload = r);
              }
              
              try {
                logToServer('Đang học khuôn mặt từ ảnh đăng ký...', 'PROCESS');
                // Retry detection a few times if needed
                for (let i = 0; i < 3; i++) {
                   const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                   if (detection) {
                     registeredDescriptor = detection.descriptor;
                     console.log('Registered face processed success');
                     logToServer('Đã học xong khuôn mặt đăng ký!', 'SUCCESS');
                     return;
                   }
                   await new Promise(r => setTimeout(r, 500));
                }
                
                logToServer('Không tìm thấy khuôn mặt trong ảnh đăng ký sau 3 lần thử', 'ERROR');
                document.getElementById('result-message').innerText = '⚠️ Không tìm thấy khuôn mặt trong ảnh đăng ký. Vui lòng chọn ảnh rõ nét hơn.';
                document.getElementById('result-message').style.display = 'block';
                document.getElementById('result-message').style.color = '#f57c00';
              } catch (e) {
                logToServer('Lỗi xử lý ảnh đăng ký: ' + e.message, 'ERROR');
                console.error('Error processing registered image', e);
              }
            }

            async function startVerification() {
              const video = document.getElementById('live-video');
              const btn = document.getElementById('btn-verify');
              const msg = document.getElementById('result-message');
              const errorMsg = document.getElementById('error-msg');
              
              msg.style.display = 'none';
              errorMsg.style.display = 'none';
              
              // Open Camera
              if (!stream) {
                try {
                  logToServer('Đang yêu cầu quyền Camera...', 'SYSTEM');
                  stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                  video.srcObject = stream;
                  btn.style.background = '#f57c00';
                  document.getElementById('btn-text').innerText = 'Đang soi... Giữ nguyên nhé!';
                  logToServer('Đã mở Camera thành công', 'SUCCESS');
                  
                  // Start detecting loop
                  detectLoop();
                } catch (err) {
                  logToServer('Không mở được Camera: ' + err.message, 'ERROR');
                  errorMsg.innerText = 'Không mở được Camera: ' + err.message;
                  errorMsg.style.display = 'block';
                }
              }
            }

            let consecutiveMatches = 0;
            const REQUIRED_MATCHES = 10; // Cần 10 khung hình khớp liên tiếp (~1-2 giây)
            
            async function detectLoop() {
              const video = document.getElementById('live-video');
              const btn = document.getElementById('btn-verify');
              if (!stream) return;

              // Check if video is playing
              if (video.paused || video.ended || !faceapi.nets.ssdMobilenetv1.params) {
                 return setTimeout(() => detectLoop(), 100);
              }
              
              // Detect face in video
              const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
              
              if (detection) {
                 if (!registeredDescriptor) {
                    logToServer('WARN: Chưa có ảnh đăng ký', 'WARN');
                    return;
                 }

                 const distance = faceapi.euclideanDistance(registeredDescriptor, detection.descriptor);
                 
                  // Stricter Threshold: 0.5 (Default is 0.6)
                 if (distance < 0.5) {
                    consecutiveMatches++;
                    const percent = Math.round((1 - distance) * 100);
                    
                    // UI Feedback for progress
                    document.getElementById('btn-text').innerText = 'Đang xác thực... ' + (consecutiveMatches*10) + '%';
                    btn.style.background = 'linear-gradient(90deg, #4caf50 ' + (consecutiveMatches*10) + '%, #f57c00 ' + (consecutiveMatches*10) + '%)';

                    if (consecutiveMatches >= REQUIRED_MATCHES) {
                        logToServer('Xác thực THÀNH CÔNG! Độ lệch: ' + distance.toFixed(4) + ' (' + percent + '%)', 'SUCCESS');
                        // NEW MESSAGE HERE
                        showResult(true, '✅ XÁC THỰC THÀNH CÔNG! Chúc bạn có chuyến đi vui vẻ! 🚌');
                        // CALL CONFIRM API
                        confirmBoarding();
                        
                        // Show Full Screen Success Modal
                        const modal = document.createElement('div');
                        modal.id = 'success-modal'; // Assign ID
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

                        return; // Stop loop
                    }
                 } else {
                    consecutiveMatches = 0; // Reset if any frame fails
                    document.getElementById('btn-text').innerText = 'Đang soi... Giữ nguyên nhé!';
                    btn.style.background = '#f57c00';
                 }
                 
                 setTimeout(() => detectLoop(), 100);
              } else {
                 consecutiveMatches = 0;
                 document.getElementById('btn-text').innerText = 'Không thấy mặt...';
                 setTimeout(() => detectLoop(), 100);
              }
            }

            function showResult(isMatch, text) {
              const msg = document.getElementById('result-message');
              const img = document.getElementById('registered-img');
              const lock = document.getElementById('lock-icon');
              const btn = document.getElementById('btn-verify');
              
              msg.innerText = text;
              msg.style.display = 'block';
              msg.style.color = isMatch ? '#2e7d32' : '#c62828';

              if (isMatch) {
                // Reveal image
                if (img) img.style.filter = 'none';
                if (lock) lock.style.display = 'none';
                
                // Stop camera
                if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                  stream = null;
                }
                btn.style.display = 'none'; // Hide button on success
              } else {
                 // Stop camera ? Only if definitive fail? 
                 // For now let's stop for simple UX flow
                 if (stream) {
                   stream.getTracks().forEach(track => track.stop());
                   stream = null;
                 }
                 document.getElementById('btn-text').innerText = 'Thử lại';
                 btn.style.background = '#1976d2';
              }
            }

            // Init
            window.onload = loadModels;
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

