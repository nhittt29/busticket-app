import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Bật validation toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // loại bỏ các field không khai báo trong DTO
    forbidNonWhitelisted: true, // báo lỗi nếu có field thừa
    transform: true,           // tự động convert kiểu dữ liệu
  }));

  await app.listen(3000);
}
bootstrap();
