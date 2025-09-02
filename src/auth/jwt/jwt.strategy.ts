import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const secret: any = configService.get('JWT_SECRET');
    if (!secret) {
      console.log('JWT_SECRET is not set');
      return;
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // 令牌验证通过后执行，返回的用户信息会附加到请求对象
  async validate(payload: any) {
    // payload 包含生成令牌时传入的数据（如 sub: userId, email 等）
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      // 只返回必要字段，避免敏感信息（如密码）泄露
      select: { id: true },
    });

    // 返回的用户信息会被添加到 req.user 中
    return user;
  }
}
