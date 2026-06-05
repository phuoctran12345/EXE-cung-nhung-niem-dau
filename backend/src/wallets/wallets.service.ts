import {
  Injectable,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from './schemas/wallet-transaction.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import {
  PrivateTourRequest,
  PrivateTourRequestDocument,
} from '../private-tour-requests/schemas/private-tour-request.schema';
import { Tour, TourDocument } from '../tours/schemas/tour.schema';

export const PLATFORM_FEE_RATE = 0.1;

@Injectable()
export class WalletsService implements OnModuleInit {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(WalletTransaction.name)
    private transactionModel: Model<WalletTransactionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(PrivateTourRequest.name)
    private privateTourRequestModel: Model<PrivateTourRequestDocument>,
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.syncExistingUserWallets();
  }

  /** Tạo ví cho toàn bộ tài khoản đã có sẵn trong DB (chạy khi khởi động server). */
  async syncExistingUserWallets(): Promise<{ created: number; skipped: number }> {
    const users = await this.userModel.find().select('_id').exec();
    let created = 0;
    let skipped = 0;

    for (const user of users) {
      const exists = await this.walletModel
        .findOne({ userId: user._id, walletType: 'user' })
        .exec();
      if (!exists) {
        await this.walletModel.create({ userId: user._id, walletType: 'user' });
        created++;
      } else {
        skipped++;
      }
    }

    await this.getOrCreatePlatformWallet();
    console.log(
      `>>> [WALLETS] Đồng bộ ví: ${created} tài khoản mới, ${skipped} đã có sẵn.`,
    );
    return { created, skipped };
  }

  /** Lấy hoặc tạo ví — KHÔNG tự sửa số dư (tránh ghi đè sau khi trừ tiền). */
  private async findOrCreateUserWallet(userId: string): Promise<WalletDocument> {
    const oid = new Types.ObjectId(userId);
    let wallet = await this.walletModel
      .findOne({ userId: oid, walletType: 'user' })
      .exec();

    if (!wallet) {
      wallet = await this.walletModel.create({
        userId: oid,
        walletType: 'user',
        balance: 0,
        totalEarned: 0,
      });
    }

    return wallet;
  }

  async ensureUserWallet(userId: string | Types.ObjectId): Promise<WalletDocument> {
    return this.findOrCreateUserWallet(userId.toString());
  }

  async getOrCreateUserWallet(userId: string): Promise<WalletDocument> {
    return this.findOrCreateUserWallet(userId);
  }

  /**
   * Đồng bộ số dư từ ledger — CHỈ gọi thủ công (admin/dev).
   * Không chạy tự động khi đọc ví để tránh cộng lại tiền sau khi trừ.
   */
  async reconcileUserWalletBalance(
    userId: string,
    wallet?: WalletDocument,
  ): Promise<WalletDocument> {
    const resolved =
      wallet ?? (await this.walletModel.findOne({
        userId: new Types.ObjectId(userId),
        walletType: 'user',
      }).exec());

    if (!resolved) {
      const created = await this.walletModel.create({
        userId: new Types.ObjectId(userId),
        walletType: 'user',
        balance: 0,
        totalEarned: 0,
      });
      return this.reconcileUserWalletBalance(userId, created);
    }

    const userOid = new Types.ObjectId(userId);
    const txs = await this.transactionModel
      .find({ userId: userOid })
      .sort({ createdAt: 1 })
      .exec();

    const lastTx = await this.transactionModel
      .findOne({ userId: userOid })
      .sort({ createdAt: -1 })
      .exec();

    let balance = 0;
    let totalEarned = 0;

    for (const tx of txs) {
      const isDebit =
        tx.type === 'payment_debit' || tx.type === 'withdrawal';
      if (isDebit) {
        balance -= tx.amount;
      } else {
        balance += tx.amount;
        if (tx.type === 'payment_received' || tx.type === 'owner_credit') {
          totalEarned += tx.amount;
        }
      }
    }

    // Ưu tiên balanceAfter của giao dịch mới nhất (chính xác hơn tổng thủ công)
    if (lastTx && Number.isFinite(lastTx.balanceAfter)) {
      balance = lastTx.balanceAfter;
    }

    let changed = false;
    if (resolved.balance !== balance) {
      resolved.balance = balance;
      changed = true;
    }
    if (resolved.totalEarned !== totalEarned) {
      resolved.totalEarned = totalEarned;
      changed = true;
    }

    if (changed) {
      await resolved.save();
      console.log(
        `>>> [WALLETS] Đã đồng bộ số dư user ${userId}: ${balance.toLocaleString('vi-VN')} VNĐ`,
      );
    }

    // Gắn lại walletId cho giao dịch cũ (nếu ví bị tạo lại)
    await this.transactionModel.updateMany(
      { userId: userOid, walletId: { $ne: resolved._id } },
      { walletId: resolved._id },
    );

    return resolved;
  }

  async reconcileAllWallets(): Promise<number> {
    const users = await this.userModel.find().select('_id').exec();
    let count = 0;
    for (const user of users) {
      await this.reconcileUserWalletBalance(user._id.toString());
      count++;
    }
    return count;
  }

  async getOrCreatePlatformWallet(): Promise<WalletDocument> {
    let wallet = await this.walletModel.findOne({ walletType: 'platform' }).exec();
    if (!wallet) {
      wallet = await this.walletModel.create({ walletType: 'platform', balance: 0 });
    }
    return wallet;
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    return this.walletModel
      .findOne({ userId: new Types.ObjectId(userId), walletType: 'user' })
      .exec();
  }

  async getTransactions(userId: string, limit = 50): Promise<WalletTransaction[]> {
    return this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async settlePrivateTourPayment(params: {
    ownerId: string;
    totalAmount: number;
    requestId: string;
    orderCode: number;
  }): Promise<{ platformFee: number; ownerAmount: number }> {
    const platformFee = Math.round(params.totalAmount * PLATFORM_FEE_RATE);
    const ownerAmount = params.totalAmount - platformFee;

    const ownerWallet = await this.findOrCreateUserWallet(params.ownerId);
    const platformWallet = await this.getOrCreatePlatformWallet();

    ownerWallet.balance += ownerAmount;
    ownerWallet.totalEarned += ownerAmount;
    await ownerWallet.save();

    platformWallet.balance += platformFee;
    platformWallet.totalEarned += platformFee;
    await platformWallet.save();

    await this.transactionModel.create({
      walletId: ownerWallet._id,
      userId: new Types.ObjectId(params.ownerId),
      type: 'owner_credit',
      amount: ownerAmount,
      balanceAfter: ownerWallet.balance,
      description: `Thanh toán tour cá nhân (90% sau phí sàn)`,
      referenceType: 'private_tour_request',
      referenceId: new Types.ObjectId(params.requestId),
      orderCode: params.orderCode,
    });

    await this.transactionModel.create({
      walletId: platformWallet._id,
      type: 'platform_fee',
      amount: platformFee,
      balanceAfter: platformWallet.balance,
      description: `Phí sàn 10% tour cá nhân #${params.orderCode}`,
      referenceType: 'private_tour_request',
      referenceId: new Types.ObjectId(params.requestId),
      orderCode: params.orderCode,
    });

    return { platformFee, ownerAmount };
  }

  async getPlatformStats(): Promise<{ balance: number; totalEarned: number }> {
    const wallet = await this.getOrCreatePlatformWallet();
    return { balance: wallet.balance, totalEarned: wallet.totalEarned };
  }

  /** Doanh thu owner: 90% tour cá nhân (owner_credit) + tour thường đã thanh toán */
  async getOwnerDashboardStats(ownerId: string) {
    const ownerOid = new Types.ObjectId(ownerId);
    const wallet = await this.findOrCreateUserWallet(ownerId);

    const ownerCredits = await this.transactionModel
      .find({ userId: ownerOid, type: 'owner_credit' })
      .sort({ createdAt: -1 })
      .exec();
    const privateTourRevenue = ownerCredits.reduce((s, t) => s + t.amount, 0);

    const tours = await this.tourModel
      .find({
        $or: [{ ownerId: ownerOid }, { ownerId: ownerId }],
        status: 'approved',
      })
      .exec();
    const tourIds = tours.map((t) => t._id);

    const standardBookings = await this.bookingModel
      .find({
        tourId: { $in: tourIds },
        status: 'paid',
        $or: [
          { bookingType: { $exists: false } },
          { bookingType: 'standard' },
        ],
      })
      .populate('customerId', 'name email')
      .populate('tourId', 'title location')
      .sort({ createdAt: -1 })
      .exec();

    const standardTourRevenue = standardBookings.reduce(
      (s, b) => s + (b.totalPrice || 0),
      0,
    );

    const privateTourPaid = await this.privateTourRequestModel
      .find({ acceptedOwnerId: ownerOid, status: 'paid' })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    const recentEarnings = [
      ...ownerCredits.slice(0, 5).map((t) => ({
        id: t._id,
        type: 'private_tour',
        amount: t.amount,
        description: t.description,
        createdAt: (t as any).createdAt,
        orderCode: t.orderCode,
      })),
      ...standardBookings.slice(0, 5).map((b) => ({
        id: b._id,
        type: 'standard_tour',
        amount: b.totalPrice,
        description: (b.tourId as any)?.title || 'Tour thường',
        createdAt: (b as any).createdAt,
        customerName: (b.customerId as any)?.name,
        orderCode: b.orderCode,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 8);

    return {
      totalRevenue: privateTourRevenue + standardTourRevenue,
      walletBalance: wallet.balance,
      totalEarned: wallet.totalEarned,
      privateTourRevenue,
      standardTourRevenue,
      totalBookings: standardBookings.length + privateTourPaid.length,
      activeTours: tours.length,
      recentEarnings,
    };
  }

  /** Doanh thu admin: 10% phí sàn (platform_fee) + tổng GMV */
  async getAdminDashboardStats() {
    const platformWallet = await this.getOrCreatePlatformWallet();

    const platformFees = await this.transactionModel
      .find({ type: 'platform_fee' })
      .sort({ createdAt: -1 })
      .exec();
    const platformRevenue = platformFees.reduce((s, t) => s + t.amount, 0);

    const standardBookings = await this.bookingModel
      .find({
        status: 'paid',
        $or: [
          { bookingType: { $exists: false } },
          { bookingType: 'standard' },
        ],
      })
      .exec();
    const standardGmv = standardBookings.reduce(
      (s, b) => s + (b.totalPrice || 0),
      0,
    );

    const privateTourPaid = await this.privateTourRequestModel
      .find({ status: 'paid' })
      .exec();
    const privateGmv = privateTourPaid.reduce(
      (s, r) => s + (r.totalPaidAmount || 0),
      0,
    );

    return {
      platformRevenue,
      platformBalance: platformWallet.balance,
      totalGmv: standardGmv + privateGmv,
      standardGmv,
      privateGmv,
      totalTransactions:
        standardBookings.length + privateTourPaid.length,
      recentPlatformFees: platformFees.slice(0, 8).map((t) => ({
        id: t._id,
        amount: t.amount,
        description: t.description,
        createdAt: (t as any).createdAt,
        orderCode: t.orderCode,
      })),
    };
  }

  async debitWallet(
    userId: string,
    amount: number,
    description = 'Thanh toán',
    referenceId?: string,
  ): Promise<WalletDocument> {
    const debit = Math.round(Number(amount));
    if (!Number.isFinite(debit) || debit <= 0) {
      throw new BadRequestException('Số tiền trừ không hợp lệ.');
    }

    const wallet = await this.findOrCreateUserWallet(userId);
    if (wallet.balance < debit) {
      throw new BadRequestException('Số dư ví không đủ.');
    }

    wallet.balance -= debit;
    await wallet.save();

    await this.transactionModel.create({
      walletId: wallet._id,
      userId: new Types.ObjectId(userId),
      type: 'payment_debit',
      amount: debit,
      balanceAfter: wallet.balance,
      description,
      referenceType: referenceId ? 'private_tour_request' : undefined,
      referenceId: referenceId
        ? new Types.ObjectId(referenceId)
        : undefined,
    });

    return wallet;
  }

  /** Đặt số dư ví chính xác (dev / admin), ghi transaction điều chỉnh. */
  async setWalletBalance(
    userId: string,
    targetBalance: number,
    description = 'Điều chỉnh số dư (admin)',
  ): Promise<WalletDocument> {
    const balance = Math.round(Number(targetBalance));
    if (!Number.isFinite(balance) || balance < 0) {
      throw new BadRequestException('Số dư không hợp lệ.');
    }

    const wallet = await this.findOrCreateUserWallet(userId);
    const diff = balance - wallet.balance;

    if (diff === 0) return wallet;

    wallet.balance = balance;
    if (diff > 0) {
      wallet.totalEarned += diff;
    }
    await wallet.save();

    await this.transactionModel.create({
      walletId: wallet._id,
      userId: new Types.ObjectId(userId),
      type: diff > 0 ? 'payment_received' : 'payment_debit',
      amount: Math.abs(diff),
      balanceAfter: wallet.balance,
      description,
    });

    return wallet;
  }

  async creditWallet(
    userId: string,
    amount: number,
    description = 'Nạp tiền',
  ): Promise<WalletDocument> {
    const credit = Math.round(Number(amount));
    if (!Number.isFinite(credit) || credit <= 0) {
      throw new BadRequestException('Số tiền nạp không hợp lệ.');
    }

    const wallet = await this.findOrCreateUserWallet(userId);
    wallet.balance += credit;
    wallet.totalEarned += credit;
    await wallet.save();

    await this.transactionModel.create({
      walletId: wallet._id,
      userId: new Types.ObjectId(userId),
      type: 'payment_received',
      amount: credit,
      balanceAfter: wallet.balance,
      description,
    });

    return wallet;
  }
}
