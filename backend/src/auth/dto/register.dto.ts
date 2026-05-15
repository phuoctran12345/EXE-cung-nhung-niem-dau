// DTO định nghĩa cấu trúc dữ liệu gửi lên khi người dùng đăng ký tài khoản mới từ mobile
export class RegisterDto {
  // Họ và tên người dùng
  name!: string;

  // Địa chỉ email đăng ký
  email!: string;

  // Mật khẩu tài khoản
  password!: string;
}
