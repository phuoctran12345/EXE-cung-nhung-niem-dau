import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Hàm khởi động toàn bộ ứng dụng backend NestJS
async function bootstrap() {
  // Tạo đối tượng app từ AppModule
  const app = await NestFactory.create(AppModule);

  // Kích hoạt CORS để cho phép các client (mobile/web) gọi API dễ dàng
  app.enableCors();

  // Đặt tiền tố toàn cục /api cho tất cả các endpoint (ví dụ: /api/auth/login)
  app.setGlobalPrefix('api');

  // Lắng nghe cổng từ biến môi trường hoặc cổng mặc định 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
