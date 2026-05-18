import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Khởi tạo Google OAuth2 Client
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  // Đăng nhập Google (Mobile & Web)
  async googleLogin(dto: GoogleLoginDto) {
    const { idToken } = dto;
    try {
      let payload;
      // Xác thực dựa trên loại token (Access Token của Web thường bắt đầu bằng ya29)
      const isAccessToken = idToken.startsWith('ya29') || idToken.split('.').length !== 3;

      if (isAccessToken) {
        // Xử lý Access Token (Web)
        await this.googleClient.getTokenInfo(idToken);
        payload = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`).then(r => r.json());
      } else {
        // Xử lý ID Token (Mobile)
        const ticket = await this.googleClient.verifyIdToken({ idToken, audience: this.configService.get('GOOGLE_CLIENT_ID') });
        payload = ticket.getPayload();
      }

      if (!payload) throw new UnauthorizedException('Xác thực thất bại');
      const { email, name, picture } = payload;

      let user = await this.usersService.findByEmail(email!);
      if (!user) {
        user = await this.usersService.create({ name: name!, email: email!, password: `google_${Date.now()}`, avatarUrl: picture, role: 'customer' });
      }

      if (user.status === 'locked') throw new UnauthorizedException('Tài khoản bị khóa');

      return {
        success: true,
        data: {
          token: this.jwtService.sign({ email: user.email, sub: user._id, role: user.role }),
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
        }
      };
    } catch (e) {
      console.error('>>> [BACKEND] Lỗi xác thực Google chi tiết:', e);
      throw new UnauthorizedException('Lỗi xác thực Google');
    }
  }

  // Hàm xử lý đăng nhập
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm người dùng trong database
    const user = await this.usersService.findByEmail(email);

    // Kiểm tra thông tin tài khoản, mật khẩu và trạng thái
    if (!user || user.password !== password) {
      throw new UnauthorizedException({
        success: false,
        message: 'Sai email hoặc mật khẩu. Vui lòng thử lại',
      });
    }

    if (user.status === 'locked') {
      throw new UnauthorizedException({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.',
      });
    }

    // Tạo JWT token thật
    const payload = { email: user.email, sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Trả về token và thông tin người dùng
    return {
      success: true,
      data: {
        token: token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  }

  // Hàm xử lý đăng ký tài khoản mới
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException({
        success: false,
        message: 'Email đã tồn tại! Vui lòng sử dụng email khác',
      });
    }

    // Tạo người dùng mới trong DB
    const newUser = await this.usersService.create({
      name,
      email,
      password,
      role: 'customer', // Mặc định là khách hàng
    });

    // Tạo token cho người dùng mới
    const payload = { email: newUser.email, sub: newUser._id, role: newUser.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      data: {
        token: token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    };
  }

  // Lấy thông tin hồ sơ
  async getProfile(userId?: string) {
    if (!userId) {
      throw new BadRequestException('Thiếu ID người dùng');
    }
    const users = await this.usersService.findAll();
    const user = users.find(u => (u as any)._id.toString() === userId);

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    return {
      success: true,
      data: {
        user: {
          id: (user as any)._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    };
  }
}
