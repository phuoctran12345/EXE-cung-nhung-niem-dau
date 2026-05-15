import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Lấy danh sách tất cả người dùng
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Tìm người dùng theo email
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Tạo người dùng mới
  async create(userData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  // Cập nhật trạng thái tài khoản (Khóa/Mở khóa)
  async updateStatus(id: string, status: 'active' | 'locked'): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }
}
