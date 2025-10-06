// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as admin from 'firebase-admin'; // Import admin to check Firebase initialization

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set global prefix for all API routes
  app.setGlobalPrefix('api');

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve static image files
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'images'), {
    prefix: '/images/',
  });

  await app.listen(3000);

  // Check Firebase initialization and print message right before server start log
  if (admin.apps.length) {
    console.log('🔥 Firebase connected successfully!');
  } else {
    console.error('❌ Firebase initialization failed!');
    process.exit(1); // Exit if Firebase is not initialized
  }

  console.log('🚀 Server is running on: http://localhost:3000');
}
bootstrap();