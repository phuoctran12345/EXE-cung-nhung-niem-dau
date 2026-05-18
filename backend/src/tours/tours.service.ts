import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tour, TourDocument } from './schemas/tour.schema';
import { Destination, DestinationDocument } from './schemas/destination.schema';
import { Activity, ActivityDocument } from './schemas/activity.schema';

@Injectable()
export class ToursService {
  constructor(
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

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
    let tour;
    
    // Kiểm tra nếu id truyền vào là một ObjectId hợp lệ
    if (Types.ObjectId.isValid(id)) {
      tour = await this.tourModel.findById(id).exec();
    } else {
      // Nếu không phải ObjectId, tìm theo slug (URL đẹp)
      tour = await this.tourModel.findOne({ slug: id }).exec();
    }
    
    if (!tour) throw new NotFoundException('Không tìm thấy tour');
    return tour;
  }

  // Hàm tạo slug từ chuỗi (Hỗ trợ tiếng Việt)
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Chuẩn hóa Unicode để tách dấu
      .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu sau khi tách
      .replace(/[đĐ]/g, 'd') // Chuyển đ thành d
      .replace(/([^0-9a-z-\s])/g, '') // Xóa ký tự đặc biệt
      .replace(/(\s+)/g, '-') // Thay khoảng trắng bằng gạch ngang
      .replace(/-+/g, '-') // Xóa gạch ngang thừa
      .replace(/^-+|-+$/g, ''); // Xóa gạch ngang ở đầu/cuối
  }

  // Tạo tour mới (Chủ tour)
  async create(tourData: Partial<Tour>, ownerId: string): Promise<Tour> {
    const ownerIdStr = ownerId?.toString?.() ?? '';
    if (!Types.ObjectId.isValid(ownerIdStr)) {
      throw new BadRequestException(
        'Phiên đăng nhập không hợp lệ. Vui lòng đăng xuất và đăng nhập lại.',
      );
    }

    const slug = this.slugify(tourData.title || 'tour');
    const uniqueSlug = `${slug}-${Date.now()}`;
    const ownerObjectId = new Types.ObjectId(ownerIdStr);

    const newTour = new this.tourModel({
      title: tourData.title,
      description: tourData.description,
      price: tourData.price,
      location: tourData.location,
      slots: tourData.slots,
      itinerary: tourData.itinerary ?? [],
      dates: tourData.dates ?? [],
      images: tourData.images ?? [],
      ownerId: ownerObjectId,
      slug: uniqueSlug,
      status: 'pending',
    });
    return newTour.save();
  }

  // Lấy danh sách tour của một chủ tour
  async findByOwner(ownerId: string): Promise<Tour[]> {
    const ownerIdStr = ownerId?.toString?.() ?? '';
    if (!Types.ObjectId.isValid(ownerIdStr)) {
      return [];
    }
    const ownerObjectId = new Types.ObjectId(ownerIdStr);
    return this.tourModel
      .find({
        $or: [{ ownerId: ownerObjectId }, { ownerId: ownerIdStr }],
      })
      .sort({ createdAt: -1 })
      .exec();
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

  // Lấy tất cả địa điểm (Destinations) cho Private Tour
  async findAllDestinations(): Promise<Destination[]> {
    return this.destinationModel.find().exec();
  }

  // Lấy hoạt động theo ID địa điểm cho Private Tour
  async findActivitiesByDestination(destinationId: string): Promise<Activity[]> {
    return this.activityModel.find({ destinationId: new Types.ObjectId(destinationId) }).exec();
  }
}
