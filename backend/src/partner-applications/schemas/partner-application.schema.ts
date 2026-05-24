import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PartnerApplicationDocument = PartnerApplication & Document;

@Schema({ timestamps: true })
export class PartnerApplication {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  taxCode: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  website?: string;

  @Prop()
  licenseUrl?: string;

  @Prop({ required: true })
  representativeName: string;

  @Prop()
  signatureDataUrl?: string;

  @Prop({
    required: true,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  status: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  reviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;
}

export const PartnerApplicationSchema =
  SchemaFactory.createForClass(PartnerApplication);

PartnerApplicationSchema.index({ userId: 1 });
PartnerApplicationSchema.index({ status: 1 });
