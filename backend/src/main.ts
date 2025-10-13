import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join, resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as admin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Prefix API
  app.setGlobalPrefix('api');

  // ✅ Validation global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Static files — point to correct uploads directory
  const uploadsPath = resolve(__dirname, '..', '..', 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Optional: serve /images separately
  app.useStaticAssets(join(uploadsPath, 'images'), {
    prefix: '/images/',
  });

  await app.listen(3000);

  if (admin.apps.length) {
    console.log('🔥 Firebase connected successfully!');
  } else {
    console.error('❌ Firebase initialization failed!');
    process.exit(1);
  }

  const formattedPath = uploadsPath.replace(/\\/g, '/');
  console.log('🚀 Server running on: http://localhost:3000');
  console.log(`🖼️  Static files available at: http://localhost:3000/uploads`);
  console.log(`📂  Physical path: ${formattedPath}`);
}
bootstrap();
