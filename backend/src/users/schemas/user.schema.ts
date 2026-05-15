import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string; // Tên người dùng

  @Prop({ required: true, unique: true })
  email: string; // Email (dùng để đăng nhập)

  @Prop({ required: true })
  password: string; // Mật khẩu (nên hash nhưng ở đây để đơn giản)

  @Prop()
  phone: string; // Số điện thoại

  @Prop({ default: 'https://i.pravatar.cc/150?img=5' })
  avatarUrl: string; // Ảnh đại diện

  @Prop({ default: 'customer', enum: ['customer', 'tour_owner', 'admin'] })
  role: string; // Vai trò (Khách hàng, Chủ tour, Admin)

  @Prop({ default: 'active', enum: ['active', 'locked'] })
  status: string; // Trạng thái tài khoản (Hoạt động, Bị khóa)
}

export const UserSchema = SchemaFactory.createForClass(User);
