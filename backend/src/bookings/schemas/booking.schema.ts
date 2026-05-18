import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Tour', required: true })
  tourId: Types.ObjectId; // ID của tour được đặt

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId; // ID của khách hàng đặt tour

  @Prop({ required: true, default: 'pending', enum: ['pending', 'paid', 'cancelled'] })
  status: string; // Trạng thái đặt tour (Chờ thanh toán, Đã thanh toán, Đã hủy)

  @Prop({ required: true })
  totalPrice: number; // Tổng số tiền thanh toán (sau giảm giá)

  @Prop()
  originalPrice: number; // Tổng trước khi áp dụng voucher

  @Prop()
  voucherCode: string; // Mã voucher đã áp dụng

  @Prop({ type: Types.ObjectId, ref: 'Voucher' })
  voucherId: Types.ObjectId;

  @Prop({ default: 0 })
  discountAmount: number; // Số tiền được giảm

  @Prop()
  paymentId: string; // Mã giao dịch từ cổng thanh toán (PayOS)

  @Prop({ unique: true })
  orderCode: number; // Mã đơn hàng dùng để đối soát với PayOS

  @Prop({ default: 1 })
  numberOfParticipants: number; // Số người tham gia
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
