import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import PayOS = require('@payos/node');
import { ConfigService } from '@nestjs/config';
import { ToursService } from '../tours/tours.service';

@Injectable()
export class BookingsService {
  private payOS: any;
  // Bộ nhớ tạm để lưu thông tin đơn hàng trong lúc chờ thanh toán (Tránh ghi rác vào DB)
  private pendingBookingsCache = new Map<number, any>();

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private configService: ConfigService,
    private toursService: ToursService,
  ) {
    this.payOS = new PayOS(
      this.configService.get<string>('PAYOS_CLIENT_ID') || '',
      this.configService.get<string>('PAYOS_API_KEY') || '',
      this.configService.get<string>('PAYOS_CHECKSUM_KEY') || '',
    );
  }

  // Khởi tạo quy trình đặt tour - KHÔNG lưu vào DB ngay lập tức
  async create(bookingData: Partial<Booking>): Promise<any> {
    if (!bookingData.tourId) {
      throw new BadRequestException('Thiếu ID tour.');
    }
    
    const tour = await this.toursService.findOne(bookingData.tourId.toString());
    if (tour.slots < (bookingData.numberOfParticipants || 1)) {
      throw new BadRequestException('Tour đã hết chỗ.');
    }

    // Tạo orderCode duy nhất làm khóa định danh
    const orderCode = Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 1000);

    // CHỈ lưu thông tin vào bộ nhớ tạm (Cache), không ghi vào database
    this.pendingBookingsCache.set(orderCode, {
      ...bookingData,
      orderCode: orderCode,
      createdAt: new Date(),
    });

    // Thiết lập tự động xóa khỏi bộ nhớ tạm sau 30 phút để tránh rò rỉ bộ nhớ
    setTimeout(() => {
      if (this.pendingBookingsCache.has(orderCode)) {
        this.pendingBookingsCache.delete(orderCode);
      }
    }, 30 * 60 * 1000);

    const paymentBody = {
      orderCode: orderCode,
      amount: bookingData.totalPrice,
      description: `TM-${orderCode}`, 
      cancelUrl: `${this.configService.get<string>('FRONTEND_URL')}/payment/cancel?orderCode=${orderCode}`,
      returnUrl: `${this.configService.get<string>('FRONTEND_URL')}/payment/success?orderCode=${orderCode}`,
    };

    try {
      console.log('>>> [BACKEND] Đang tạo link thanh toán cho Order tạm thời:', orderCode);
      const paymentLink = await this.payOS.createPaymentLink(paymentBody);
      return {
        success: true,
        data: { paymentUrl: paymentLink.checkoutUrl },
      };
    } catch (error) {
      console.error('>>> [BACKEND] Lỗi PayOS:', error);
      throw new BadRequestException('Lỗi hệ thống thanh toán. Vui lòng thử lại.');
    }
  }

  // Xử lý Webhook từ PayOS - Đây là lúc chính thức lưu đơn hàng vào DB
  async handleWebhook(webhookData: any): Promise<any> {
    try {
      const verifiedData = this.payOS.verifyPaymentWebhookData(webhookData);
      console.log('>>> [BACKEND] Webhook xác thực thành công cho Order:', verifiedData.orderCode);

      if (verifiedData.code === '00') {
        // Chỉ lưu vào DB khi mã code là "00" (Thành công)
        await this.saveBookingToDb(verifiedData.orderCode);
      }

      return { success: true };
    } catch (error) {
      console.error('>>> [BACKEND] Lỗi Webhook:', error);
      throw new BadRequestException('Xác thực Webhook thất bại.');
    }
  }

  // Hàm bổ trợ: Lấy dữ liệu từ Cache và thực hiện lưu vào Database
  private async saveBookingToDb(orderCode: number): Promise<Booking | null> {
    const existing = await this.bookingModel.findOne({ orderCode }).exec();
    if (existing) return existing;

    const cachedData = this.pendingBookingsCache.get(orderCode);
    if (!cachedData) {
      console.error(`>>> [BACKEND] Không tìm thấy dữ liệu tạm cho Order: ${orderCode}`);
      return null;
    }

    const newBooking = new this.bookingModel({
      ...cachedData,
      status: 'paid',
    });
    const savedBooking = await newBooking.save();

    const tour = await this.toursService.findOne(savedBooking.tourId.toString());
    await this.toursService.updateSlots(savedBooking.tourId.toString(), tour.slots - savedBooking.numberOfParticipants);

    this.pendingBookingsCache.delete(orderCode);

    console.log(`>>> [BACKEND] Đã CHÍNH THỨC lưu đơn hàng ${orderCode} vào cơ sở dữ liệu.`);
    return savedBooking;
  }

  async handlePaymentSuccess(orderCode: number): Promise<any> {
    const booking = await this.saveBookingToDb(orderCode);
    if (!booking) {
      const existing = await this.bookingModel.findOne({ orderCode }).exec();
      if (!existing) throw new NotFoundException('Thông tin đơn hàng không tồn tại hoặc đã quá hạn.');
      return existing;
    }
    return booking;
  }

  async findByCustomer(customerId: string): Promise<Booking[]> {
    return this.bookingModel.find({ customerId: new Types.ObjectId(customerId), status: 'paid' }).populate('tourId').exec();
  }

  // Lấy danh sách khách hàng đã thanh toán của một tour cụ thể (Dành cho chủ tour)
  async findByTour(tourId: string, ownerId: string): Promise<Booking[]> {
    const tour = await this.toursService.findOne(tourId);
    if (tour.ownerId.toString() !== ownerId) {
      throw new BadRequestException('Bạn không có quyền truy cập dữ liệu khách hàng của tour này.');
    }
    return this.bookingModel.find({ tourId: new Types.ObjectId(tourId), status: 'paid' }).populate('customerId').exec();
  }

  async findByOwner(ownerId: string): Promise<Booking[]> {
    const tours = await this.toursService.findByOwner(ownerId);
    const tourIds = tours.map((t: any) => t._id);
    return this.bookingModel.find({ tourId: { $in: tourIds }, status: 'paid' })
      .populate('tourId')
      .populate('customerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Lấy TOÀN BỘ danh sách đơn hàng đã thanh toán (Dành cho Admin thống kê)
  async findAllForAdmin(): Promise<Booking[]> {
    return this.bookingModel.find({ status: 'paid' })
      .populate('tourId')
      .populate('customerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async cancel(id: string): Promise<any> {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Không tìm thấy đơn đặt tour');
    booking.status = 'cancelled';
    return booking.save();
  }
}
