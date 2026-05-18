import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY') || 'default_secret_key',
    });
  }

  async validate(payload: any) {
    // Tìm người dùng trong database từ payload của token
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }
    // Trả về thông tin người dùng (sẽ được gán vào request.user)
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}
