import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';
import { Tour, TourSchema } from './schemas/tour.schema';
import { Destination, DestinationSchema } from './schemas/destination.schema';
import { Activity, ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tour.name, schema: TourSchema },
      { name: Destination.name, schema: DestinationSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  controllers: [ToursController],
  providers: [ToursService],
  exports: [ToursService],
})
export class ToursModule {}
