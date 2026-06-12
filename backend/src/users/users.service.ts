import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private walletsService: WalletsService,
  ) {}

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
    const saved = await newUser.save();
    await this.walletsService.ensureUserWallet(saved._id);
    return saved;
  }

  // Cập nhật trạng thái tài khoản (Khóa/Mở khóa)
  async updateStatus(id: string, status: 'active' | 'locked'): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { avatarUrl }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async updateRole(id: string, role: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { role, status: 'active' }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }
}
