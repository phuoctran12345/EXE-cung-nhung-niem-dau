import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ToursModule } from './tours/tours.module';
import { BookingsModule } from './bookings/bookings.module';
import { UploadsModule } from './uploads/uploads.module';
import { AiModule } from './ai/ai.module';
import { VouchersModule } from './vouchers/vouchers.module';

// Module chính của ứng dụng backend
@Module({
  imports: [
    // Cấu hình ConfigModule để đọc file .env
    ConfigModule.forRoot({
      isGlobal: true, // Cho phép sử dụng ConfigService ở mọi nơi
    }),
    // Kết nối với MongoDB bằng chuỗi connection string từ .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_CONNECTION_STRING'),
      }),
    }),
    // Tích hợp các module cốt lõi cho Phase 1 (MVP)
    AuthModule,
    UsersModule,
    ToursModule,
    BookingsModule,
    VouchersModule,
    UploadsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
