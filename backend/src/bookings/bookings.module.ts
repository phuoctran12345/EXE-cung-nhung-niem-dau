import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { ToursModule } from '../tours/tours.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { PrivateTourRequestsModule } from '../private-tour-requests/private-tour-requests.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ToursModule,
    VouchersModule,
    PrivateTourRequestsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
