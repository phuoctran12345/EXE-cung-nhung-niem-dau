import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

// Controller xử lý các route xác thực cho ứng dụng di động
@Controller('auth')
export class AuthController {
  // Tiêm phụ thuộc AuthService vào controller
  constructor(private readonly authService: AuthService) {}

  // Route đăng nhập Google: POST /auth/google
  @Post('google')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleLoginDto);
  }

  // Route đăng nhập API: POST /auth/login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Route đăng ký API: POST /auth/register
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Route lấy thông tin tài khoản API: GET /auth/profile
  @Get('profile')
  async getProfile(@Query('id') id?: string) {
    return this.authService.getProfile(id);
  }
}
