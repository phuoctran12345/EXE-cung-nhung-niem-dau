import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async create(@Body() dto: CreateVoucherDto, @Request() req: any) {
    return this.vouchersService.create(req.user.id, dto);
  }

  @Get('owner/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findMyVouchers(@Request() req: any) {
    return this.vouchersService.findByOwner(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateVoucherDto>,
    @Request() req: any,
  ) {
    return this.vouchersService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.vouchersService.remove(id, req.user.id);
    return { success: true };
  }

  @Post('validate')
  async validate(@Body() dto: ApplyVoucherDto) {
    return this.vouchersService.validateAndCalculate(
      dto.code,
      dto.tourId,
      dto.subtotal,
    );
  }
}
