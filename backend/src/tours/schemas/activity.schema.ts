import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'Destination', required: true })
  destinationId: Types.ObjectId; // ID của địa điểm thuộc về (Tham chiếu sang bảng Destination)

  @Prop({ required: true })
  name: string; // Tên hoạt động

  @Prop()
  address: string; // Địa chỉ diễn ra hoạt động

  @Prop({ required: true })
  price: number; // Giá tiền của hoạt động

  @Prop()
  image: string; // Hình ảnh hoạt động

  @Prop()
  durationHours: number; // Thời lượng diễn ra hoạt động (tính bằng giờ)

  @Prop({ default: 'Sightseeing' })
  category: string; // Loại dịch vụ (Sightseeing, Dining, Entertainment, Shopping, Relax)
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
