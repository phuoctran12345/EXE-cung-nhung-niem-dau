import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PartnerApplicationsService } from './partner-applications.service';
import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { RejectPartnerApplicationDto } from './dto/reject-partner-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('partner-applications')
export class PartnerApplicationsController {
  constructor(
    private readonly partnerApplicationsService: PartnerApplicationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreatePartnerApplicationDto, @Request() req: any) {
    const data = await this.partnerApplicationsService.create(req.user.id, dto);
    return { success: true, data };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMine(@Request() req: any) {
    const data = await this.partnerApplicationsService.findMyApplication(
      req.user.id,
    );
    return { success: true, data };
  }

  @Patch('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async updateMyCompanyProfile(
    @Body() dto: UpdateCompanyProfileDto,
    @Request() req: any,
  ) {
    const data = await this.partnerApplicationsService.updateCompanyProfile(
      req.user.id,
      dto,
    );
    return { success: true, data, message: 'Đã cập nhật hồ sơ công ty' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query('status') status?: string) {
    const data = await this.partnerApplicationsService.findAll(status);
    return { success: true, data };
  }

  @Get(':id/license')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async streamLicense(
    @Param('id') id: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    const file = await this.partnerApplicationsService.fetchLicenseFile(id);
    const disposition = download === '1' ? 'attachment' : 'inline';
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `${disposition}; filename="${file.filename}"`,
      'Content-Length': file.buffer.length,
    });
    res.send(file.buffer);
  }

  // API lấy file PDF hợp đồng
  @Get(':id/contract')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async streamContract(
    @Param('id') id: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    const file = await this.partnerApplicationsService.fetchContractFile(id);
    const disposition = download === '1' ? 'attachment' : 'inline';
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `${disposition}; filename="${file.filename}"`,
      'Content-Length': file.buffer.length,
    });
    res.send(file.buffer);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const data = await this.partnerApplicationsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(@Param('id') id: string, @Request() req: any) {
    const data = await this.partnerApplicationsService.approve(
      id,
      req.user.id,
    );
    return { success: true, data, message: 'Đã duyệt hồ sơ đối tác' };
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectPartnerApplicationDto,
    @Request() req: any,
  ) {
    const data = await this.partnerApplicationsService.reject(
      id,
      req.user.id,
      dto.reason,
    );
    return { success: true, data, message: 'Đã từ chối hồ sơ đối tác' };
  }
}
