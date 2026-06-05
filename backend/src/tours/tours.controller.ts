import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
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

  // --- Static routes (phải đặt TRƯỚC :id để tránh conflict) ---

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

  // --- Admin: Quản lý thành phố & dịch vụ (Private Tour) ---

  @Post('admin/destinations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createDestination(@Body() body: { name: string; slug?: string; toursCount?: string; img?: string }) {
    return this.toursService.createDestination(body);
  }

  @Patch('admin/destinations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateDestination(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; toursCount?: string; img?: string },
  ) {
    return this.toursService.updateDestination(id, body);
  }

  @Delete('admin/destinations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteDestination(@Param('id') id: string) {
    await this.toursService.deleteDestination(id);
    return { success: true, message: 'Đã xóa thành phố và các dịch vụ liên quan' };
  }

  @Post('admin/destinations/:id/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createActivity(
    @Param('id') destinationId: string,
    @Body() body: {
      name: string;
      address?: string;
      price: number;
      image?: string;
      durationHours?: number;
      category?: string;
    },
  ) {
    return this.toursService.createActivity(destinationId, body);
  }

  @Patch('admin/activities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateActivity(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      address?: string;
      price?: number;
      image?: string;
      durationHours?: number;
      category?: string;
    },
  ) {
    return this.toursService.updateActivity(id, body);
  }

  @Delete('admin/activities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteActivity(@Param('id') id: string) {
    await this.toursService.deleteActivity(id);
    return { success: true, message: 'Đã xóa dịch vụ' };
  }

  // API cho Chủ tour: Đăng tour mới
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async create(@Body() tourData: any, @Request() req: any) {
    const { ownerId: _ignored, _id, ...safeTourData } = tourData;
    return this.toursService.create(safeTourData, req.user.id);
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

  // API cho Khách hàng: Xem chi tiết tour (đặt cuối — :id là wildcard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.toursService.findOne(id);
  }
}
