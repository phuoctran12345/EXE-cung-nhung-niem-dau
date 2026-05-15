import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TourDocument = Tour & Document;

@Schema({ timestamps: true })
export class Tour {
  @Prop({ required: true })
  title: string; // Tên tour

  @Prop()
  description: string; // Mô tả tour

  @Prop({ required: true })
  price: number; // Giá tour

  @Prop({ required: true })
  location: string; // Địa điểm khởi hành

  @Prop({ required: true })
  slots: number; // Số lượng chỗ trống

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId; // ID của chủ tour (Nhà cung cấp)

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string; // Trạng thái kiểm duyệt (Chờ, Duyệt, Từ chối)

  @Prop([String])
  itinerary: string[]; // Lịch trình chi tiết (từng ngày)

  @Prop([Date])
  dates: Date[]; // Các ngày khởi hành dự kiến

  @Prop([String])
  images: string[]; // Danh sách hình ảnh của tour
}

export const TourSchema = SchemaFactory.createForClass(Tour);
