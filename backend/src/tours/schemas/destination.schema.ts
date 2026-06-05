import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DestinationDocument = Destination & Document;

@Schema({ timestamps: true })
export class Destination {
  @Prop({ required: true })
  name: string; // Tên địa điểm (ví dụ: Đà Nẵng)

  @Prop({ required: true, unique: true })
  slug: string; // URL thân thiện (ví dụ: da-nang)

  @Prop()
  toursCount: string; // Số lượng tour (ví dụ: 100+ Tours)

  @Prop()
  img: string; // Hình ảnh đại diện

  @Prop({ default: 650_000 })
  stayPricePerNight: number; // Giá lưu trú / đêm (phòng đôi, VNĐ)
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);
