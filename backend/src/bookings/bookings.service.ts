import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import PayOS = require('@payos/node');
import { ConfigService } from '@nestjs/config';
import { ToursService } from '../tours/tours.service';
import { VouchersService } from '../vouchers/vouchers.service';

@Injectable()
export class BookingsService {
  private payOS: any;
  // Bộ nhớ tạm để lưu thông tin đơn hàng trong lúc chờ thanh toán (Tránh ghi rác vào DB)
  private pendingBookingsCache = new Map<number, any>();

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private configService: ConfigService,
    private toursService: ToursService,
    private vouchersService: VouchersService,
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

    const tourIdStr = bookingData.tourId.toString();
    const customerIdStr = bookingData.customerId?.toString?.() ?? '';
    if (!Types.ObjectId.isValid(tourIdStr)) {
      throw new BadRequestException('ID tour không hợp lệ.');
    }
    if (!Types.ObjectId.isValid(customerIdStr)) {
      throw new BadRequestException(
        'Phiên đăng nhập không hợp lệ. Vui lòng đăng xuất và đăng nhập lại.',
      );
    }

    const tour = await this.toursService.findOne(tourIdStr);
    const resolvedTourId = ((tour as any)._id || tourIdStr).toString();
    if (tour.slots < (bookingData.numberOfParticipants || 1)) {
      throw new BadRequestException('Tour đã hết chỗ.');
    }

    const participants = bookingData.numberOfParticipants || 1;
    const subtotal = Math.round(Number(tour.price) * participants);
    const PAYOS_MIN_AMOUNT = 1000;

    let totalPrice = subtotal;
    let discountAmount = 0;
    let voucherId: string | undefined;
    let voucherCode: string | undefined;
    const codeFromClient = bookingData.voucherCode?.trim();

    if (codeFromClient) {
      const result = await this.vouchersService.validateAndCalculate(
        codeFromClient,
        resolvedTourId,
        subtotal,
      );
      if (!result.valid) {
        throw new BadRequestException(result.message || 'Voucher không hợp lệ.');
      }
      totalPrice = Math.round(result.finalPrice ?? 0);
      discountAmount = Math.round(result.discountAmount ?? 0);
      voucherId = result.voucherId;
      voucherCode = result.code;
    } else {
      totalPrice = Math.round(Number(bookingData.totalPrice ?? subtotal));
      if (Math.abs(totalPrice - subtotal) > 1) {
        throw new BadRequestException(
          'Tổng tiền không khớp. Vui lòng nhấn "Áp dụng" mã voucher trước khi thanh toán.',
        );
      }
    }

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      throw new BadRequestException('Không thể tính tổng tiền. Vui lòng thử lại.');
    }

    const orderCode = Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 1000);
    const tourObjectId = new Types.ObjectId(resolvedTourId);
    const customerObjectId = new Types.ObjectId(customerIdStr);

    const cachePayload = {
      tourId: tourObjectId,
      customerId: customerObjectId,
      numberOfParticipants: participants,
      totalPrice,
      originalPrice: subtotal,
      discountAmount,
      voucherCode,
      voucherId: voucherId ? new Types.ObjectId(voucherId) : undefined,
      orderCode,
    };

    this.pendingBookingsCache.set(orderCode, cachePayload);

    setTimeout(() => {
      if (this.pendingBookingsCache.has(orderCode)) {
        this.pendingBookingsCache.delete(orderCode);
      }
    }, 30 * 60 * 1000);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (totalPrice <= 0) {
      return this.completeFreeBooking(orderCode, frontendUrl);
    }

    if (totalPrice < PAYOS_MIN_AMOUNT) {
      throw new BadRequestException(
        `Số tiền thanh toán sau giảm giá phải tối thiểu ${PAYOS_MIN_AMOUNT.toLocaleString('vi-VN')} VNĐ (PayOS).`,
      );
    }

    const paymentBody = {
      orderCode,
      amount: totalPrice,
      description: `TM-${orderCode}`,
      cancelUrl: `${frontendUrl}/payment/cancel?orderCode=${orderCode}`,
      returnUrl: `${frontendUrl}/payment/success?orderCode=${orderCode}`,
    };

    try {
      console.log('>>> [BACKEND] Đang tạo link thanh toán:', orderCode, 'amount:', totalPrice);
      const paymentLink = await this.payOS.createPaymentLink(paymentBody);
      return {
        success: true,
        data: { paymentUrl: paymentLink.checkoutUrl },
      };
    } catch (error: any) {
      console.error('>>> [BACKEND] Lỗi PayOS:', error?.message || error);
      const payosMsg = error?.message || '';
      throw new BadRequestException(
        payosMsg.includes('amount') || payosMsg.includes('Amount')
          ? 'Số tiền thanh toán không hợp lệ với PayOS. Vui lòng kiểm tra lại mã giảm giá.'
          : 'Lỗi hệ thống thanh toán. Vui lòng thử lại.',
      );
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

  private async completeFreeBooking(
    orderCode: number,
    frontendUrl: string,
  ): Promise<{ success: boolean; data: { isFree: boolean; paymentUrl: string } }> {
    try {
      console.log('>>> [BACKEND] Đơn miễn phí (voucher 100%), orderCode:', orderCode);
      const booking = await this.saveBookingToDb(orderCode);
      if (!booking) {
        throw new BadRequestException(
          'Không thể lưu đơn hàng miễn phí. Vui lòng thử lại.',
        );
      }
      return {
        success: true,
        data: {
          isFree: true,
          paymentUrl: `${frontendUrl}/payment/success?orderCode=${orderCode}&free=1`,
        },
      };
    } catch (error: any) {
      this.pendingBookingsCache.delete(orderCode);
      console.error('>>> [BACKEND] Lỗi đơn miễn phí:', error?.message || error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error?.message || 'Không thể hoàn tất đặt tour miễn phí. Vui lòng thử lại.',
      );
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

    const bookingDoc: Record<string, unknown> = {
      tourId: cachedData.tourId,
      customerId: cachedData.customerId,
      numberOfParticipants: cachedData.numberOfParticipants,
      totalPrice: cachedData.totalPrice ?? 0,
      originalPrice: cachedData.originalPrice,
      discountAmount: cachedData.discountAmount ?? 0,
      orderCode: cachedData.orderCode,
      status: 'paid',
    };
    if (cachedData.voucherCode) bookingDoc.voucherCode = cachedData.voucherCode;
    if (cachedData.voucherId) bookingDoc.voucherId = cachedData.voucherId;

    let savedBooking: Booking;
    try {
      savedBooking = await this.bookingModel.create(bookingDoc);
    } catch (err: any) {
      console.error('>>> [BACKEND] Lỗi MongoDB khi lưu booking:', err?.message || err);
      throw new BadRequestException(
        err?.code === 11000
          ? 'Mã đơn hàng bị trùng. Vui lòng thử lại.'
          : 'Không thể lưu đơn hàng. Vui lòng thử lại.',
      );
    }

    if (cachedData.voucherId) {
      await this.vouchersService.incrementUsage(cachedData.voucherId.toString());
    }

    const tour = await this.toursService.findOne(savedBooking.tourId.toString());
    const newSlots = Math.max(0, tour.slots - savedBooking.numberOfParticipants);
    await this.toursService.updateSlots(savedBooking.tourId.toString(), newSlots);

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
    if (tour.ownerId.toString() !== ownerId.toString()) {
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
