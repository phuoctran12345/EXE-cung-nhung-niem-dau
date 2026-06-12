// Chỉ các trường hiển thị công khai, không ảnh hưởng pháp lý.
// companyName / taxCode / giấy phép phải qua admin duyệt lại nên không có ở đây.
export class UpdateCompanyProfileDto {
  address?: string;
  website?: string;
  description?: string;
  representativeName?: string;
  // Logo/avatar hiển thị với khách (lưu trên User.avatarUrl)
  avatarUrl?: string;
}
