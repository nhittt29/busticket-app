import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as admin from 'firebase-admin'; // Import admin để kiểm tra Firebase

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Đặt prefix chung cho tất cả các API
  app.setGlobalPrefix('api');

  // ✅ Kích hoạt validation toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Chỉ cho phép các field có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có field lạ
      transform: true, // Tự động transform kiểu dữ liệu
    }),
  );

  // ✅ Cho phép truy cập file tĩnh (hình ảnh, avatar, ...)
  // Cấu trúc: http://localhost:3000/uploads/avatars/filename.png
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // ✅ Nếu bạn vẫn muốn phục vụ thư mục /images riêng biệt
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'images'), {
    prefix: '/images/',
  });

  await app.listen(3000);

  // ✅ Kiểm tra kết nối Firebase trước khi chạy server
  if (admin.apps.length) {
    console.log('🔥 Firebase connected successfully!');
  } else {
    console.error('❌ Firebase initialization failed!');
    process.exit(1); // Thoát nếu Firebase chưa khởi tạo
  }

  console.log('🚀 Server is running on: http://localhost:3000');
  console.log('🖼️  Static files served at: http://localhost:3000/uploads');
}
bootstrap();
