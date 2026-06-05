import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'platform'], default: 'user' })
  walletType: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  totalEarned: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
WalletSchema.index({ userId: 1 }, { unique: true, sparse: true });
WalletSchema.index({ walletType: 1 });
