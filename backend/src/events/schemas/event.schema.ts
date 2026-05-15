import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Định nghĩa kiểu dữ liệu cho Event (Sự kiện)
export type EventDocument = Event & Document;

@Schema({ timestamps: true }) // Tự động thêm createdAt và updatedAt
export class Event {
  @Prop({ required: true })
  title: string; // Tiêu đề sự kiện

  @Prop()
  description: string; // Mô tả sự kiện

  @Prop({ required: true })
  date: Date; // Ngày diễn ra

  @Prop({ required: true })
  location: string; // Địa điểm

  @Prop({ default: 0 })
  price: number; // Giá vé
}

// Tạo Schema từ class Event
export const EventSchema = SchemaFactory.createForClass(Event);
