import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Hàm khởi động toàn bộ ứng dụng backend NestJS
async function bootstrap() {
  // Tạo đối tượng app từ AppModule
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  });

  // Đặt tiền tố toàn cục /api cho tất cả các endpoint (ví dụ: /api/auth/login)
  app.setGlobalPrefix('api');

  // Lắng nghe cổng từ biến môi trường hoặc cổng mặc định 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
