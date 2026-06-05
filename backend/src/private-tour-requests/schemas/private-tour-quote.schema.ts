import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrivateTourQuoteDocument = PrivateTourQuote & Document;

@Schema({ timestamps: true })
export class PrivateTourQuote {
  @Prop({ type: Types.ObjectId, ref: 'PrivateTourRequest', required: true })
  requestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  offeredPrice: number;

  @Prop()
  message: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected', 'expired'],
  })
  status: string;
}

export const PrivateTourQuoteSchema =
  SchemaFactory.createForClass(PrivateTourQuote);
PrivateTourQuoteSchema.index({ requestId: 1, ownerId: 1 }, { unique: true });
