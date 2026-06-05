import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import PayOS = require('@payos/node');
import { ConfigService } from '@nestjs/config';
import { ToursService } from '../tours/tours.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { WalletsService } from '../wallets/wallets.service';

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
    private walletsService: WalletsService,
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
    const isPrivateTour =
      (bookingData as { isPrivateTour?: boolean }).isPrivateTour === true ||
      (bookingData as { bookingType?: string }).bookingType === 'private';
    if (isPrivateTour) {
      throw new BadRequestException(
        'Tour cá nhân vui lòng gửi yêu cầu qua mục Tour Cá Nhân. Thanh toán chỉ thực hiện sau khi chấp nhận báo giá từ chủ tour.',
      );
    }
    const subtotal = isPrivateTour
      ? Math.round(Number(bookingData.totalPrice ?? 0))
      : Math.round(Number(tour.price) * participants);
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
      if (!isPrivateTour && Math.abs(totalPrice - subtotal) > 1) {
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
    const ownerId = (tour as any).ownerId?.toString?.() ?? '';

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://travel-match-jade.vercel.app';

    if (totalPrice <= 0) {
      const cachePayload = {
        tourId: tourObjectId,
        customerId: customerObjectId,
        ownerId: (tour as any).ownerId,
        numberOfParticipants: participants,
        totalPrice,
        originalPrice: subtotal,
        discountAmount,
        voucherCode,
        voucherId: voucherId ? new Types.ObjectId(voucherId) : undefined,
        orderCode,
        customerNotes: (bookingData as { customerNotes?: string }).customerNotes,
        bookingType: 'standard' as const,
        walletUsed: 0,
      };
      this.pendingBookingsCache.set(orderCode, cachePayload);
      return this.completeFreeBooking(orderCode, frontendUrl);
    }

    const wallet = await this.walletsService.getOrCreateUserWallet(customerIdStr);
    const walletBalance = wallet.balance;
    const walletUsed = Math.min(walletBalance, totalPrice);
    const payosAmount = totalPrice - walletUsed;

    if (payosAmount > 0 && payosAmount < PAYOS_MIN_AMOUNT) {
      throw new BadRequestException(
        `Số dư ví không đủ để thanh toán phần còn lại (${payosAmount.toLocaleString('vi-VN')} VNĐ). ` +
          `Vui lòng nạp thêm vào ví hoặc đảm bảo số dư đủ toàn bộ đơn hàng.`,
      );
    }

    const cachePayload = {
      tourId: tourObjectId,
      customerId: customerObjectId,
      ownerId: (tour as any).ownerId,
      numberOfParticipants: participants,
      totalPrice,
      originalPrice: subtotal,
      discountAmount,
      voucherCode,
      voucherId: voucherId ? new Types.ObjectId(voucherId) : undefined,
      orderCode,
      customerNotes: (bookingData as { customerNotes?: string }).customerNotes,
      bookingType: 'standard' as const,
      walletUsed,
    };

    this.pendingBookingsCache.set(orderCode, cachePayload);

    setTimeout(() => {
      if (this.pendingBookingsCache.has(orderCode)) {
        this.pendingBookingsCache.delete(orderCode);
      }
    }, 30 * 60 * 1000);

    if (walletUsed > 0) {
      await this.walletsService.debitWallet(
        customerIdStr,
        walletUsed,
        `Thanh toán tour (trừ ví) #${orderCode}`,
        { type: 'booking_pending' },
        orderCode,
      );
    }

    if (payosAmount <= 0) {
      return this.completeWalletBooking(orderCode, frontendUrl, {
        totalPrice,
        walletUsed,
        payosAmount: 0,
        walletBalance: walletBalance - walletUsed,
      });
    }

    const paymentBody = {
      orderCode,
      amount: payosAmount,
      description: `TM-${orderCode}`,
      cancelUrl: `${frontendUrl}/payment/cancel?orderCode=${orderCode}`,
      returnUrl: `${frontendUrl}/payment/success?orderCode=${orderCode}`,
    };

    try {
      console.log(
        '>>> [BACKEND] Tạo link PayOS:',
        orderCode,
        'payos:',
        payosAmount,
        'wallet:',
        walletUsed,
      );
      const paymentLink = await this.payOS.createPaymentLink(paymentBody);
      return {
        success: true,
        data: {
          paymentUrl: paymentLink.checkoutUrl,
          totalPrice,
          walletUsed,
          payosAmount,
          walletBalance: walletBalance - walletUsed,
        },
      };
    } catch (error: any) {
      this.pendingBookingsCache.delete(orderCode);
      if (walletUsed > 0) {
        await this.walletsService.creditWallet(
          customerIdStr,
          walletUsed,
          `Hoàn tiền ví do lỗi thanh toán PayOS #${orderCode}`,
        );
      }
      console.error('>>> [BACKEND] Lỗi PayOS:', error?.message || error);
      const payosMsg = error?.message || '';
      throw new BadRequestException(
        payosMsg.includes('amount') || payosMsg.includes('Amount')
          ? 'Số tiền thanh toán không hợp lệ với PayOS. Vui lòng kiểm tra lại mã giảm giá.'
          : 'Lỗi hệ thống thanh toán. Vui lòng thử lại.',
      );
    }
  }

  private async completeWalletBooking(
    orderCode: number,
    frontendUrl: string,
    paymentInfo: {
      totalPrice: number;
      walletUsed: number;
      payosAmount: number;
      walletBalance: number;
    },
  ): Promise<{
    success: boolean;
    data: {
      paidFully: boolean;
      redirectUrl: string;
      totalPrice: number;
      walletUsed: number;
      payosAmount: number;
      walletBalance: number;
    };
  }> {
    try {
      const booking = await this.saveBookingToDb(orderCode);
      if (!booking) {
        throw new BadRequestException('Không thể hoàn tất đặt tour. Vui lòng thử lại.');
      }
      return {
        success: true,
        data: {
          paidFully: true,
          redirectUrl: `${frontendUrl}/payment/success?orderCode=${orderCode}&wallet=1`,
          ...paymentInfo,
        },
      };
    } catch (error: any) {
      const cached = this.pendingBookingsCache.get(orderCode);
      if (cached?.walletUsed > 0) {
        await this.walletsService.creditWallet(
          cached.customerId.toString(),
          cached.walletUsed,
          `Hoàn tiền ví do lỗi hoàn tất đơn #${orderCode}`,
        );
      }
      this.pendingBookingsCache.delete(orderCode);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error?.message || 'Không thể hoàn tất đặt tour. Vui lòng thử lại.',
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
    if (cachedData.customerNotes) bookingDoc.customerNotes = cachedData.customerNotes;
    if (cachedData.bookingType) bookingDoc.bookingType = cachedData.bookingType;
    if (cachedData.privateTourDetails) bookingDoc.privateTourDetails = cachedData.privateTourDetails;
    if (cachedData.ownerStatus) bookingDoc.ownerStatus = cachedData.ownerStatus;

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

    if (
      savedBooking.totalPrice > 0 &&
      cachedData.ownerId &&
      cachedData.bookingType === 'standard'
    ) {
      await this.walletsService.settleStandardTourPayment({
        ownerId: cachedData.ownerId.toString(),
        totalAmount: savedBooking.totalPrice,
        bookingId: (savedBooking as BookingDocument)._id.toString(),
        orderCode,
      });
      console.log(
        `>>> [BACKEND] Đã chia ví owner/sàn cho đơn tour thường #${orderCode}.`,
      );
    }

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

  // Lấy tất cả đơn tour cá nhân đã thanh toán (dành cho chủ tour xem và nhận/từ chối)
  async findPrivateToursForOwners(): Promise<Booking[]> {
    return this.bookingModel
      .find({ bookingType: 'private', status: 'paid' })
      .populate('customerId')
      .populate('assignedOwnerId', 'name email')
      .populate('rejectedByOwnerId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Chủ tour nhận hoặc từ chối đơn tour cá nhân
  async respondToPrivateTour(
    bookingId: string,
    ownerId: string,
    action: 'accept' | 'reject',
  ): Promise<Booking> {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Không tìm thấy đơn đặt tour.');
    if (booking.bookingType !== 'private') {
      throw new BadRequestException('Đơn này không phải tour cá nhân.');
    }
    if (booking.status !== 'paid') {
      throw new BadRequestException('Đơn chưa thanh toán hoặc đã bị hủy.');
    }
    if (booking.ownerStatus !== 'pending') {
      throw new BadRequestException(
        booking.ownerStatus === 'accepted'
          ? 'Tour này đã được chủ tour khác nhận.'
          : 'Tour này đã bị từ chối.',
      );
    }

    if (action === 'accept') {
      booking.ownerStatus = 'accepted';
      booking.assignedOwnerId = new Types.ObjectId(ownerId);
    } else {
      booking.ownerStatus = 'rejected';
      booking.rejectedByOwnerId = new Types.ObjectId(ownerId);
    }

    return booking.save();
  }
}
