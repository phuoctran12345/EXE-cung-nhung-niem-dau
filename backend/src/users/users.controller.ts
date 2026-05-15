import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Yêu cầu đăng nhập và kiểm tra quyền
@Roles('admin') // Chỉ Admin mới được vào dashboard quản lý user
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Lấy tất cả người dùng
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // Khóa/Mở khóa tài khoản
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'locked',
  ) {
    return this.usersService.updateStatus(id, status);
  }
}
