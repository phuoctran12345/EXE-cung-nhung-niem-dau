import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrivateTourRequestsController } from './private-tour-requests.controller';
import { PrivateTourRequestsService } from './private-tour-requests.service';
import {
  PrivateTourRequest,
  PrivateTourRequestSchema,
} from './schemas/private-tour-request.schema';
import {
  PrivateTourQuote,
  PrivateTourQuoteSchema,
} from './schemas/private-tour-quote.schema';
import {
  PartnerApplication,
  PartnerApplicationSchema,
} from '../partner-applications/schemas/partner-application.schema';
import { Tour, TourSchema } from '../tours/schemas/tour.schema';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrivateTourRequest.name, schema: PrivateTourRequestSchema },
      { name: PrivateTourQuote.name, schema: PrivateTourQuoteSchema },
      { name: PartnerApplication.name, schema: PartnerApplicationSchema },
      { name: Tour.name, schema: TourSchema },
    ]),
    WalletsModule,
  ],
  controllers: [PrivateTourRequestsController],
  providers: [PrivateTourRequestsService],
  exports: [PrivateTourRequestsService],
})
export class PrivateTourRequestsModule {}
