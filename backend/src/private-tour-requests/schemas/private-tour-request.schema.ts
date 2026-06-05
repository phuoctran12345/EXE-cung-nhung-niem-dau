import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrivateTourRequestDocument = PrivateTourRequest & Document;

@Schema({ timestamps: true })
export class PrivateTourRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  estimatedPrice: number;

  @Prop({ default: 1 })
  numberOfParticipants: number;

  @Prop()
  customerNotes: string;

  @Prop({ type: Object })
  privateTourDetails: Record<string, unknown>;

  @Prop({
    default: 'open',
    enum: ['open', 'accepted', 'paid', 'cancelled'],
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'PrivateTourQuote' })
  acceptedQuoteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  acceptedOwnerId: Types.ObjectId;

  @Prop()
  orderCode: number;

  @Prop()
  totalPaidAmount: number;
}

export const PrivateTourRequestSchema =
  SchemaFactory.createForClass(PrivateTourRequest);
