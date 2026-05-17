import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ToursService } from './tours.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // API cho Khách hàng: Xem danh sách tour đã duyệt (Công khai)
  @Get()
  async findAll(@Query('search') search?: string) {
    if (search) {
      return this.toursService.search(search);
    }
    return this.toursService.findAllApproved();
  }

  // API cho Private Tour: Lấy tất cả địa điểm
  @Get('destinations')
  async findAllDestinations() {
    return this.toursService.findAllDestinations();
  }

  // API cho Private Tour: Lấy hoạt động theo địa điểm
  @Get('destinations/:id/activities')
  async findActivitiesByDestination(@Param('id') id: string) {
    return this.toursService.findActivitiesByDestination(id);
  }

  // API cho Khách hàng: Xem chi tiết tour (Công khai)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.toursService.findOne(id);
  }

  // API cho Chủ tour: Đăng tour mới
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async create(@Body() tourData: any, @Request() req: any) {
    // Tự động lấy ownerId từ Token đã xác thực
    return this.toursService.create({ ...tourData, ownerId: req.user.id });
  }

  // API cho Chủ tour: Xem danh sách tour của mình
  @Get('owner/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findByOwner(@Request() req: any) {
    return this.toursService.findByOwner(req.user.id);
  }

  // API cho Admin: Lấy danh sách tour để kiểm duyệt
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllForAdmin() {
    return this.toursService.findAllForAdmin();
  }

  // API cho Admin: Duyệt hoặc từ chối tour
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
  ) {
    return this.toursService.updateStatus(id, status);
  }
}
