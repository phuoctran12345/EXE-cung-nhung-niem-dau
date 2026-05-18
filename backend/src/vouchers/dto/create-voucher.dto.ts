export class CreateVoucherDto {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  tourIds?: string[];
  isActive?: boolean;
}
