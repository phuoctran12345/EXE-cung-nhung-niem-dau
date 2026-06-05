import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true })
  walletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'owner_credit',
      'platform_fee',
      'payment_received',
      'payment_debit',
      'withdrawal',
    ],
  })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  balanceAfter: number;

  @Prop()
  description: string;

  @Prop()
  referenceType: string;

  @Prop({ type: Types.ObjectId })
  referenceId: Types.ObjectId;

  @Prop()
  orderCode: number;
}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);
