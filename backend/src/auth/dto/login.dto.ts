// DTO định nghĩa cấu trúc dữ liệu gửi lên khi người dùng đăng nhập từ mobile
export class LoginDto {
  // Địa chỉ email của người dùng
  email!: string;

  // Mật khẩu tài khoản
  password!: string;
}
