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

  // --- Admin: Quản lý địa điểm (Private Tour) ---

  async createDestination(data: Partial<Destination>): Promise<Destination> {
    if (!data.name?.trim()) {
      throw new BadRequestException('Tên thành phố là bắt buộc');
    }
    const slug = data.slug?.trim() || this.slugify(data.name);
    const existing = await this.destinationModel.findOne({ slug }).exec();
    if (existing) {
      throw new BadRequestException('Slug thành phố đã tồn tại');
    }
    const destination = new this.destinationModel({
      name: data.name.trim(),
      slug,
      toursCount: data.toursCount || '0 Tours',
      img: data.img || '',
    });
    return destination.save();
  }

  async updateDestination(id: string, data: Partial<Destination>): Promise<Destination> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID địa điểm không hợp lệ');
    }
    const update: Partial<Destination> = {};
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.toursCount !== undefined) update.toursCount = data.toursCount;
    if (data.img !== undefined) update.img = data.img;
    if (data.slug !== undefined) {
      const slug = data.slug.trim() || this.slugify(data.name || '');
      const duplicate = await this.destinationModel.findOne({ slug, _id: { $ne: id } }).exec();
      if (duplicate) {
        throw new BadRequestException('Slug thành phố đã tồn tại');
      }
      update.slug = slug;
    }
    const destination = await this.destinationModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!destination) throw new NotFoundException('Không tìm thấy địa điểm');
    return destination;
  }

  async deleteDestination(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID địa điểm không hợp lệ');
    }
    const destination = await this.destinationModel.findByIdAndDelete(id).exec();
    if (!destination) throw new NotFoundException('Không tìm thấy địa điểm');
    await this.activityModel.deleteMany({ destinationId: new Types.ObjectId(id) }).exec();
  }

  // --- Admin: Quản lý dịch vụ / hoạt động ---

  async createActivity(destinationId: string, data: Partial<Activity>): Promise<Activity> {
    if (!Types.ObjectId.isValid(destinationId)) {
      throw new BadRequestException('ID địa điểm không hợp lệ');
    }
    const destination = await this.destinationModel.findById(destinationId).exec();
    if (!destination) throw new NotFoundException('Không tìm thấy địa điểm');

    if (!data.name?.trim()) {
      throw new BadRequestException('Tên dịch vụ là bắt buộc');
    }
    if (data.price === undefined || data.price < 0) {
      throw new BadRequestException('Giá dịch vụ không hợp lệ');
    }

    const activity = new this.activityModel({
      destinationId: new Types.ObjectId(destinationId),
      name: data.name.trim(),
      address: data.address || '',
      price: data.price,
      image: data.image || '',
      durationHours: data.durationHours ?? 1,
      category: data.category || 'Sightseeing',
    });
    return activity.save();
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID dịch vụ không hợp lệ');
    }
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.address !== undefined) update.address = data.address;
    if (data.price !== undefined) update.price = data.price;
    if (data.image !== undefined) update.image = data.image;
    if (data.durationHours !== undefined) update.durationHours = data.durationHours;
    if (data.category !== undefined) update.category = data.category;

    const activity = await this.activityModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!activity) throw new NotFoundException('Không tìm thấy dịch vụ');
    return activity;
  }

  async deleteActivity(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID dịch vụ không hợp lệ');
    }
    const activity = await this.activityModel.findByIdAndDelete(id).exec();
    if (!activity) throw new NotFoundException('Không tìm thấy dịch vụ');
  }
}
