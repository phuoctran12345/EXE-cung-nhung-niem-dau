import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import PayOS = require('@payos/node');
import { ConfigService } from '@nestjs/config';
import {
  PrivateTourRequest,
  PrivateTourRequestDocument,
} from './schemas/private-tour-request.schema';
import {
  PrivateTourQuote,
  PrivateTourQuoteDocument,
} from './schemas/private-tour-quote.schema';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class PrivateTourRequestsService {
  private payOS: any;
  private pendingPaymentsCache = new Map<number, any>();

  constructor(
    @InjectModel(PrivateTourRequest.name)
    private requestModel: Model<PrivateTourRequestDocument>,
    @InjectModel(PrivateTourQuote.name)
    private quoteModel: Model<PrivateTourQuoteDocument>,
    private configService: ConfigService,
    private walletsService: WalletsService,
  ) {
    this.payOS = new PayOS(
      this.configService.get<string>('PAYOS_CLIENT_ID') || '',
      this.configService.get<string>('PAYOS_API_KEY') || '',
      this.configService.get<string>('PAYOS_CHECKSUM_KEY') || '',
    );
  }

  async createRequest(
    customerId: string,
    data: {
      estimatedPrice: number;
      numberOfParticipants?: number;
      customerNotes?: string;
      privateTourDetails?: Record<string, unknown>;
    },
  ): Promise<PrivateTourRequest> {
    const price = Math.round(Number(data.estimatedPrice));
    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException('Giá gợi ý không hợp lệ.');
    }

    return this.requestModel.create({
      customerId: new Types.ObjectId(customerId),
      estimatedPrice: price,
      numberOfParticipants: data.numberOfParticipants || 1,
      customerNotes: data.customerNotes,
      privateTourDetails: data.privateTourDetails,
      status: 'open',
    });
  }

  async findByCustomer(customerId: string): Promise<any[]> {
    const requests = await this.requestModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(
      requests.map(async (req) => {
        const quotes = await this.quoteModel
          .find({ requestId: req._id })
          .populate('ownerId', 'name email avatarUrl')
          .sort({ createdAt: -1 })
          .exec();
        return { ...req.toObject(), quotes };
      }),
    );
  }

  async findOpenForOwners(): Promise<PrivateTourRequest[]> {
    return this.requestModel
      .find({ status: 'open' })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllForOwners(): Promise<any[]> {
    const requests = await this.requestModel
      .find()
      .populate('customerId', 'name email')
      .populate('acceptedOwnerId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(
      requests.map(async (req) => {
        const quotes = await this.quoteModel
          .find({ requestId: req._id })
          .populate('ownerId', 'name email')
          .sort({ createdAt: -1 })
          .exec();
        return { ...req.toObject(), quotes };
      }),
    );
  }

  async findOwnerQuotes(ownerId: string): Promise<PrivateTourQuote[]> {
    return this.quoteModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .populate({
        path: 'requestId',
        populate: { path: 'customerId', select: 'name email' },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async submitQuote(
    requestId: string,
    ownerId: string,
    data: { offeredPrice: number; message?: string },
  ): Promise<PrivateTourQuote> {
    const request = await this.requestModel.findById(requestId);
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu tour.');
    if (request.status !== 'open') {
      throw new BadRequestException('Yêu cầu này không còn nhận báo giá.');
    }

    const price = Math.round(Number(data.offeredPrice));
    if (!Number.isFinite(price) || price < 1000) {
      throw new BadRequestException('Giá báo phải tối thiểu 1.000 VNĐ.');
    }

    const existing = await this.quoteModel.findOne({
      requestId: new Types.ObjectId(requestId),
      ownerId: new Types.ObjectId(ownerId),
    });
    if (existing) {
      existing.offeredPrice = price;
      existing.message = data.message ?? '';
      existing.status = 'pending';
      return existing.save();
    }

    return this.quoteModel.create({
      requestId: new Types.ObjectId(requestId),
      ownerId: new Types.ObjectId(ownerId),
      offeredPrice: price,
      message: data.message,
      status: 'pending',
    });
  }

  async acceptQuote(
    quoteId: string,
    customerId: string,
  ): Promise<PrivateTourRequest> {
    const quote = await this.quoteModel.findById(quoteId);
    if (!quote) throw new NotFoundException('Không tìm thấy báo giá.');
    if (quote.status !== 'pending') {
      throw new BadRequestException('Báo giá này không còn khả dụng.');
    }

    const request = await this.requestModel.findById(quote.requestId);
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu tour.');
    if (request.customerId.toString() !== customerId) {
      throw new BadRequestException('Bạn không có quyền chấp nhận báo giá này.');
    }
    if (request.status !== 'open') {
      throw new BadRequestException('Yêu cầu này đã được xử lý.');
    }

    request.status = 'accepted';
    request.acceptedQuoteId = quote._id as Types.ObjectId;
    request.acceptedOwnerId = quote.ownerId;
    await request.save();

    quote.status = 'accepted';
    await quote.save();

    await this.quoteModel.updateMany(
      {
        requestId: request._id,
        _id: { $ne: quote._id },
        status: 'pending',
      },
      { status: 'rejected' },
    );

    return request;
  }

  async initiatePayment(
    requestId: string,
    customerId: string,
  ): Promise<{
    success: boolean;
    data: {
      paidFully?: boolean;
      paymentUrl?: string;
      redirectUrl?: string;
      totalPrice: number;
      walletUsed: number;
      payosAmount: number;
      walletBalance: number;
    };
  }> {
    const request = await this.requestModel.findById(requestId);
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu tour.');
    if (request.customerId.toString() !== customerId) {
      throw new BadRequestException('Bạn không có quyền thanh toán yêu cầu này.');
    }
    if (request.status === 'paid') {
      throw new BadRequestException('Yêu cầu này đã được thanh toán.');
    }
    if (request.status !== 'accepted') {
      throw new BadRequestException('Vui lòng chấp nhận báo giá trước khi thanh toán.');
    }

    const quote = await this.quoteModel.findById(request.acceptedQuoteId);
    if (!quote) throw new NotFoundException('Không tìm thấy báo giá đã chấp nhận.');

    const totalPrice = quote.offeredPrice;
    const PAYOS_MIN_AMOUNT = 1000;
    const wallet = await this.walletsService.getOrCreateUserWallet(customerId);
    const walletBalance = wallet.balance;
    const walletUsed = Math.min(walletBalance, totalPrice);
    const payosAmount = totalPrice - walletUsed;

    if (payosAmount > 0 && payosAmount < PAYOS_MIN_AMOUNT) {
      throw new BadRequestException(
        `Số dư ví không đủ để thanh toán phần còn lại (${payosAmount.toLocaleString('vi-VN')} VNĐ). ` +
          `Vui lòng nạp thêm vào ví hoặc đảm bảo số dư đủ toàn bộ đơn hàng.`,
      );
    }

    const orderCode =
      Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 1000);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://travel-match-jade.vercel.app';

    if (walletUsed > 0) {
      await this.walletsService.debitWallet(
        customerId,
        walletUsed,
        `Thanh toán tour cá nhân (trừ ví) #${orderCode}`,
        requestId,
      );
    }

    if (payosAmount <= 0) {
      await this.requestModel.findByIdAndUpdate(requestId, {
        status: 'paid',
        orderCode,
        totalPaidAmount: totalPrice,
      });

      await this.walletsService.settlePrivateTourPayment({
        ownerId: quote.ownerId.toString(),
        totalAmount: totalPrice,
        requestId: requestId,
        orderCode,
      });

      return {
        success: true,
        data: {
          paidFully: true,
          totalPrice,
          walletUsed,
          payosAmount: 0,
          walletBalance: walletBalance - walletUsed,
          redirectUrl: `${frontendUrl}/payment/success?orderCode=${orderCode}&type=private&wallet=1`,
        },
      };
    }

    this.pendingPaymentsCache.set(orderCode, {
      requestId: request._id,
      quoteId: quote._id,
      ownerId: quote.ownerId,
      customerId: request.customerId,
      totalPrice,
      walletUsed,
      orderCode,
    });

    setTimeout(() => {
      this.pendingPaymentsCache.delete(orderCode);
    }, 30 * 60 * 1000);

    const paymentBody = {
      orderCode,
      amount: payosAmount,
      description: `PT-${orderCode}`,
      cancelUrl: `${frontendUrl}/payment/cancel?orderCode=${orderCode}&type=private`,
      returnUrl: `${frontendUrl}/payment/success?orderCode=${orderCode}&type=private`,
    };

    try {
      const paymentLink = await this.payOS.createPaymentLink(paymentBody);
      return {
        success: true,
        data: {
          paidFully: false,
          paymentUrl: paymentLink.checkoutUrl,
          totalPrice,
          walletUsed,
          payosAmount,
          walletBalance: walletBalance - walletUsed,
        },
      };
    } catch (error: any) {
      this.pendingPaymentsCache.delete(orderCode);
      if (walletUsed > 0) {
        await this.walletsService.creditWallet(
          customerId,
          walletUsed,
          `Hoàn tiền ví do lỗi thanh toán PayOS #${orderCode}`,
        );
      }
      throw new BadRequestException(
        error?.message || 'Lỗi hệ thống thanh toán. Vui lòng thử lại.',
      );
    }
  }

  async handleWebhook(webhookData: any): Promise<any> {
    try {
      const verifiedData = this.payOS.verifyPaymentWebhookData(webhookData);
      if (verifiedData.code === '00') {
        await this.completePayment(verifiedData.orderCode);
      }
      return { success: true };
    } catch (error) {
      console.error('>>> [PRIVATE TOUR] Lỗi Webhook:', error);
      throw new BadRequestException('Xác thực Webhook thất bại.');
    }
  }

  async handlePaymentSuccess(orderCode: number): Promise<PrivateTourRequest | null> {
    return this.completePayment(orderCode);
  }

  private async completePayment(
    orderCode: number,
  ): Promise<PrivateTourRequest | null> {
    const request = await this.requestModel.findOne({ orderCode }).exec();
    if (request?.status === 'paid') return request;

    const cached = this.pendingPaymentsCache.get(orderCode);
    if (!cached) {
      if (request) return request;
      return null;
    }

    const updated = await this.requestModel.findByIdAndUpdate(
      cached.requestId,
      {
        status: 'paid',
        orderCode,
        totalPaidAmount: cached.totalPrice,
      },
      { new: true },
    );

    if (!updated) return null;

    await this.walletsService.settlePrivateTourPayment({
      ownerId: cached.ownerId.toString(),
      totalAmount: cached.totalPrice,
      requestId: cached.requestId.toString(),
      orderCode,
    });

    this.pendingPaymentsCache.delete(orderCode);
    console.log(
      `>>> [PRIVATE TOUR] Đã thanh toán #${orderCode}, chia ví owner/sàn.`,
    );
    return updated;
  }
}
