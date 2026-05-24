import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PartnerApplication,
  PartnerApplicationSchema,
} from './schemas/partner-application.schema';
import { PartnerApplicationsController } from './partner-applications.controller';
import { PartnerApplicationsService } from './partner-applications.service';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PartnerApplication.name, schema: PartnerApplicationSchema },
    ]),
    UsersModule,
    CloudinaryModule,
  ],
  controllers: [PartnerApplicationsController],
  providers: [PartnerApplicationsService],
})
export class PartnerApplicationsModule {}
