import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrivateTourRequestsService } from '../private-tour-requests/private-tour-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly privateTourRequestsService: PrivateTourRequestsService,
  ) {}

  // Đặt tour mới (Khách hàng) - Lúc này chỉ lưu vào Cache, chưa lưu vào DB
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() bookingData: any, @Request() req: any) {
    return this.bookingsService.create({ ...bookingData, customerId: req.user.id });
  }

  // Xác nhận thanh toán thành công và lưu vào DB (Dành cho Frontend gọi khi người dùng quay lại)
  @Post('confirm-payment')
  async confirmPayment(@Query('orderCode') orderCode: string) {
    console.log('>>> [BACKEND] Khách hàng quay lại xác nhận đơn hàng:', orderCode);
    return this.bookingsService.handlePaymentSuccess(Number(orderCode));
  }

  // Lấy lịch sử đặt tour (Khách hàng xem của chính mình)
  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  async findMyHistory(@Request() req: any) {
    return this.bookingsService.findByCustomer(req.user.id);
  }

  // Hủy đơn hàng (Áp dụng cho admin hoặc trường hợp đặc biệt)
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }

  // Lấy danh sách khách hàng đặt tour của một tour cụ thể (Chủ tour)
  @Get('tour/:tourId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findByTour(@Param('tourId') tourId: string, @Request() req: any) {
    return this.bookingsService.findByTour(tourId, req.user.id);
  }

  // Lấy TOÀN BỘ danh sách đơn hàng đã thanh toán của chủ tour
  @Get('owner/all-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findAllByOwner(@Request() req: any) {
    return this.bookingsService.findByOwner(req.user.id);
  }

  // Lấy tất cả đơn tour cá nhân đã thanh toán (Chủ tour xem và chọn nhận/từ chối)
  @Get('owner/private-tours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findPrivateTours() {
    return this.bookingsService.findPrivateToursForOwners();
  }

  // Chủ tour nhận hoặc từ chối tour cá nhân
  @Patch(':id/owner-response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async respondToPrivateTour(
    @Param('id') id: string,
    @Body('action') action: 'accept' | 'reject',
    @Request() req: any,
  ) {
    return this.bookingsService.respondToPrivateTour(id, req.user.id, action);
  }

  // Lấy TOÀN BỘ danh sách đơn hàng dành cho Admin
  @Get('admin/all-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllForAdmin() {
    return this.bookingsService.findAllForAdmin();
  }

  // Webhook tiếp nhận thông báo tự động từ hệ thống PayOS
  @Post('webhook')
  async handlePayOSWebhook(@Body() webhookData: any) {
    console.log('>>> [BACKEND] Nhận Webhook từ PayOS:', webhookData);
    try {
      await this.privateTourRequestsService.handleWebhook(webhookData);
    } catch {
      // Không phải đơn tour cá nhân — xử lý tiếp như booking thường
    }
    return this.bookingsService.handleWebhook(webhookData);
  }
}
