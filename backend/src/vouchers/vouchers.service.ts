import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Voucher, VoucherDocument } from './schemas/voucher.schema';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ToursService } from '../tours/tours.service';

export interface VoucherCalculation {
  valid: boolean;
  message?: string;
  voucherId?: string;
  code?: string;
  discountAmount?: number;
  subtotal?: number;
  finalPrice?: number;
}

@Injectable()
export class VouchersService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
    private toursService: ToursService,
  ) {}

  async create(ownerId: string, dto: CreateVoucherDto): Promise<Voucher> {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.voucherModel.findOne({ code }).exec();
    if (existing) {
      throw new BadRequestException('Mã voucher đã tồn tại.');
    }

    if (dto.discountType === 'percentage' && (dto.discountValue <= 0 || dto.discountValue > 100)) {
      throw new BadRequestException('Giảm giá theo % phải từ 1 đến 100.');
    }
    if (dto.discountType === 'fixed' && dto.discountValue <= 0) {
      throw new BadRequestException('Giá trị giảm cố định phải lớn hơn 0.');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu.');
    }

    const voucher = new this.voucherModel({
      code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderAmount: dto.minOrderAmount ?? 0,
      maxDiscountAmount: dto.maxDiscountAmount,
      startDate,
      endDate,
      maxUsage: dto.maxUsage,
      ownerId: new Types.ObjectId(ownerId),
      tourIds: (dto.tourIds ?? []).map((id) => new Types.ObjectId(id)),
      isActive: dto.isActive ?? true,
    });

    return voucher.save();
  }

  async findByOwner(ownerId: string): Promise<Voucher[]> {
    return this.voucherModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    ownerId: string,
    updates: Partial<CreateVoucherDto>,
  ): Promise<Voucher> {
    const voucher = await this.voucherModel.findById(id).exec();
    if (!voucher) throw new NotFoundException('Không tìm thấy voucher.');
    const ownerIdStr = ownerId.toString();
    if (voucher.ownerId.toString() !== ownerIdStr) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa voucher này.');
    }

    if (updates.code) {
      const code = updates.code.trim().toUpperCase();
      const duplicate = await this.voucherModel
        .findOne({ code, _id: { $ne: id } })
        .exec();
      if (duplicate) throw new BadRequestException('Mã voucher đã tồn tại.');
      voucher.code = code;
    }
    if (updates.discountType) voucher.discountType = updates.discountType;
    if (updates.discountValue !== undefined) voucher.discountValue = updates.discountValue;
    if (updates.minOrderAmount !== undefined) voucher.minOrderAmount = updates.minOrderAmount;
    if (updates.maxDiscountAmount !== undefined) {
      voucher.maxDiscountAmount = updates.maxDiscountAmount;
    }
    if (updates.startDate) voucher.startDate = new Date(updates.startDate);
    if (updates.endDate) voucher.endDate = new Date(updates.endDate);
    if (updates.maxUsage !== undefined) voucher.maxUsage = updates.maxUsage;
    if (updates.tourIds) {
      voucher.tourIds = updates.tourIds.map((tid) => new Types.ObjectId(tid));
    }
    if (updates.isActive !== undefined) voucher.isActive = updates.isActive;

    if (updates.discountType === 'percentage' && updates.discountValue !== undefined) {
      if (updates.discountValue <= 0 || updates.discountValue > 100) {
        throw new BadRequestException('Giảm giá theo % phải từ 1 đến 100.');
      }
    }
    if (updates.discountType === 'fixed' && updates.discountValue !== undefined) {
      if (updates.discountValue <= 0) {
        throw new BadRequestException('Giá trị giảm cố định phải lớn hơn 0.');
      }
    }
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.endDate) <= new Date(updates.startDate)) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu.');
      }
    }

    return voucher.save();
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const voucher = await this.voucherModel.findById(id).exec();
    if (!voucher) throw new NotFoundException('Không tìm thấy voucher.');
    const ownerIdStr = ownerId.toString();
    if (voucher.ownerId.toString() !== ownerIdStr) {
      throw new ForbiddenException('Bạn không có quyền xóa voucher này.');
    }
    await this.voucherModel.findByIdAndDelete(id).exec();
  }

  async validateAndCalculate(
    code: string,
    tourId: string,
    subtotal: number,
  ): Promise<VoucherCalculation> {
    if (!code?.trim()) {
      return { valid: false, message: 'Vui lòng nhập mã voucher.' };
    }
    if (subtotal <= 0) {
      return { valid: false, message: 'Tổng đơn hàng không hợp lệ.' };
    }

    const voucher = await this.voucherModel
      .findOne({ code: code.trim().toUpperCase() })
      .exec();

    if (!voucher) {
      return { valid: false, message: 'Mã voucher không tồn tại.' };
    }

    const tour = await this.toursService.findOne(tourId);
    const resolvedTourId = (tour as any)._id?.toString() || tourId;

    if (tour.ownerId.toString() !== voucher.ownerId.toString()) {
      return { valid: false, message: 'Voucher không áp dụng cho tour này.' };
    }

    if (
      voucher.tourIds.length > 0 &&
      !voucher.tourIds.some((id) => id.toString() === resolvedTourId)
    ) {
      return { valid: false, message: 'Voucher không áp dụng cho tour này.' };
    }

    if (!voucher.isActive) {
      return { valid: false, message: 'Voucher đã bị vô hiệu hóa.' };
    }

    const now = new Date();
    if (now < voucher.startDate) {
      return { valid: false, message: 'Voucher chưa có hiệu lực.' };
    }
    if (now > voucher.endDate) {
      return { valid: false, message: 'Voucher đã hết hạn.' };
    }

    if (voucher.usedCount >= voucher.maxUsage) {
      return { valid: false, message: 'Voucher đã hết lượt sử dụng.' };
    }

    if (subtotal < voucher.minOrderAmount) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')} VNĐ để dùng mã này.`,
      };
    }

    const discountAmount = this.computeDiscount(voucher, subtotal);
    const finalPrice = Math.max(0, subtotal - discountAmount);

    return {
      valid: true,
      voucherId: (voucher as any)._id.toString(),
      code: voucher.code,
      discountAmount,
      subtotal,
      finalPrice,
    };
  }

  private computeDiscount(voucher: Voucher, subtotal: number): number {
    if (voucher.discountType === 'percentage' && voucher.discountValue >= 100) {
      return subtotal;
    }

    let discount = 0;
    if (voucher.discountType === 'percentage') {
      discount = Math.round(subtotal * (voucher.discountValue / 100));
      if (voucher.maxDiscountAmount != null) {
        discount = Math.min(discount, voucher.maxDiscountAmount);
      }
    } else {
      discount = voucher.discountValue;
    }
    return Math.min(discount, subtotal);
  }

  async incrementUsage(voucherId: string): Promise<void> {
    await this.voucherModel
      .findByIdAndUpdate(voucherId, { $inc: { usedCount: 1 } })
      .exec();
  }
}
