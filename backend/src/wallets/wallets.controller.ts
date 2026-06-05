import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyWallet(@Request() req: any) {
    const wallet = await this.walletsService.getOrCreateUserWallet(req.user.id);
    return wallet;
  }

  @Get('me/transactions')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@Request() req: any) {
    return this.walletsService.getTransactions(req.user.id);
  }

  @Get('platform')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPlatformWallet() {
    return this.walletsService.getPlatformStats();
  }

  @Get('owner/dashboard-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async getOwnerDashboardStats(@Request() req: any) {
    return this.walletsService.getOwnerDashboardStats(req.user.id);
  }

  @Get('admin/dashboard-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminDashboardStats() {
    return this.walletsService.getAdminDashboardStats();
  }

  @Post('admin/credit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminCredit(
    @Body() body: { userId: string; amount: number; description?: string },
  ) {
    const wallet = await this.walletsService.creditWallet(
      body.userId,
      body.amount,
      body.description,
    );
    return { success: true, data: wallet };
  }

  /** Chỉ dùng khi dev — nạp tiền test không cần đăng nhập admin */
  @Post('dev/reconcile/:userId')
  async devReconcile(@Param('userId') userId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Không khả dụng trên production.');
    }
    const wallet = await this.walletsService.reconcileUserWalletBalance(userId);
    return { success: true, data: wallet };
  }

  @Post('dev/set-balance')
  async devSetBalance(
    @Body() body: { userId: string; balance: number; description?: string },
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Không khả dụng trên production.');
    }
    const wallet = await this.walletsService.setWalletBalance(
      body.userId,
      body.balance,
      body.description,
    );
    return { success: true, data: wallet };
  }

  @Post('dev/credit')
  async devCredit(
    @Body() body: { userId: string; amount: number; description?: string },
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Không khả dụng trên production.');
    }
    const wallet = await this.walletsService.creditWallet(
      body.userId,
      body.amount,
      body.description ?? 'Nạp tiền test (dev)',
    );
    return { success: true, data: wallet };
  }
}
