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
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrivateTourRequest.name, schema: PrivateTourRequestSchema },
      { name: PrivateTourQuote.name, schema: PrivateTourQuoteSchema },
    ]),
    WalletsModule,
  ],
  controllers: [PrivateTourRequestsController],
  providers: [PrivateTourRequestsService],
  exports: [PrivateTourRequestsService],
})
export class PrivateTourRequestsModule {}
