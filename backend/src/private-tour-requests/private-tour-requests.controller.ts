import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PrivateTourRequestsService } from './private-tour-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('private-tour-requests')
export class PrivateTourRequestsController {
  constructor(
    private readonly privateTourRequestsService: PrivateTourRequestsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Request() req: any) {
    const request = await this.privateTourRequestsService.createRequest(
      req.user.id,
      body,
    );
    return { success: true, data: request };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMy(@Request() req: any) {
    return this.privateTourRequestsService.findByCustomer(req.user.id);
  }

  @Get('owner/open')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findOpenForOwners() {
    return this.privateTourRequestsService.findOpenForOwners();
  }

  @Get('owner/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findAllForOwners() {
    return this.privateTourRequestsService.findAllForOwners();
  }

  @Get('owner/my-quotes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async findOwnerQuotes(@Request() req: any) {
    return this.privateTourRequestsService.findOwnerQuotes(req.user.id);
  }

  @Post(':requestId/quotes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tour_owner')
  async submitQuote(
    @Param('requestId') requestId: string,
    @Body() body: { offeredPrice: number; message?: string },
    @Request() req: any,
  ) {
    const quote = await this.privateTourRequestsService.submitQuote(
      requestId,
      req.user.id,
      body,
    );
    return { success: true, data: quote };
  }

  @Patch('quotes/:quoteId/accept')
  @UseGuards(JwtAuthGuard)
  async acceptQuote(
    @Param('quoteId') quoteId: string,
    @Request() req: any,
  ) {
    const request = await this.privateTourRequestsService.acceptQuote(
      quoteId,
      req.user.id,
    );
    return { success: true, data: request };
  }

  @Post(':requestId/pay')
  @UseGuards(JwtAuthGuard)
  async pay(@Param('requestId') requestId: string, @Request() req: any) {
    return this.privateTourRequestsService.initiatePayment(
      requestId,
      req.user.id,
    );
  }

  @Post('confirm-payment')
  async confirmPayment(@Query('orderCode') orderCode: string) {
    const result = await this.privateTourRequestsService.handlePaymentSuccess(
      Number(orderCode),
    );
    if (!result) {
      return { success: false, message: 'Không tìm thấy đơn thanh toán.' };
    }
    return { success: true, data: result };
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: any) {
    return this.privateTourRequestsService.handleWebhook(webhookData);
  }
}
