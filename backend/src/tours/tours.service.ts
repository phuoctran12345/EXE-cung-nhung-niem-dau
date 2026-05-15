import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tour, TourDocument } from './schemas/tour.schema';

@Injectable()
export class ToursService {
  constructor(@InjectModel(Tour.name) private tourModel: Model<TourDocument>) {}

  // Lấy tất cả tour đã duyệt (Cho khách hàng)
  async findAllApproved(): Promise<Tour[]> {
    return this.tourModel.find({ status: 'approved' }).exec();
  }

  // Tìm kiếm tour theo địa điểm hoặc tiêu đề
  async search(query: string): Promise<Tour[]> {
    return this.tourModel.find({
      status: 'approved',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    }).exec();
  }

  // Lấy chi tiết tour
  async findOne(id: string): Promise<Tour> {
    const tour = await this.tourModel.findById(id).exec();
    if (!tour) throw new NotFoundException('Không tìm thấy tour');
    return tour;
  }

  // Tạo tour mới (Chủ tour)
  async create(tourData: Partial<Tour>): Promise<Tour> {
    const newTour = new this.tourModel({
      ...tourData,
      status: 'pending', // Mặc định là chờ duyệt
    });
    return newTour.save();
  }

  // Lấy danh sách tour của một chủ tour
  async findByOwner(ownerId: string): Promise<Tour[]> {
    return this.tourModel.find({ ownerId: new Types.ObjectId(ownerId) }).exec();
  }

  // Phê duyệt hoặc từ chối tour (Admin)
  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<Tour> {
    const tour = await this.tourModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!tour) throw new NotFoundException('Không tìm thấy tour');
    return tour;
  }

  // Cập nhật số lượng chỗ trống (Slots)
  async updateSlots(id: string, slots: number): Promise<Tour> {
    const tour = await this.tourModel.findByIdAndUpdate(id, { slots }, { new: true }).exec();
    if (!tour) throw new NotFoundException('Không tìm thấy tour');
    return tour;
  }

  // Lấy tất cả tour cho Admin (để kiểm duyệt)
  async findAllForAdmin(): Promise<Tour[]> {
    return this.tourModel.find().exec();
  }
}
