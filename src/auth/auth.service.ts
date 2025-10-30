import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response as ExpressResponse } from 'express';
import { log } from 'console';
import { isProd } from 'src/utils/common';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  // private configService: ConfigService, // private jwtService: JwtService, // private prisma: PrismaService,
  private setCookie(res: ExpressResponse, token: string) {
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() +
        parseInt(
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DAYS') || '7',
        ), // 7天有效期
    );

    res.cookie('refreshToken', token, {
      // httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      domain: isProd ? process.env.DOMAIN : undefined,
      expires: refreshTokenExpiresAt, // 7天有效期
    });
  }
  async login(user: LoginDto, res: ExpressResponse): Promise<any> {
    log(user);
    const { method } = user;
    if (method === 'username') {
      return await this.loginByUsername(user, res);
    } else if (method === 'phone') {
      return this.loginByPhoneEmail(user);
    } else {
      return {
        code: -1,
      };
    }
  }
  //用户密码登录
  async loginByUsername(user: LoginDto, res: ExpressResponse) {
    const { username, password } = user;
    if (!username || !password) {
      return {
        code: -1,
      };
    }
    const userInfo = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!userInfo) {
      return {
        code: -1,
        message: '用户名或密码错误',
      };
    }
    const isPasswordMatched = await bcrypt.compare(password, userInfo.password);
    if (!isPasswordMatched) {
      return {
        code: -1,
        message: '用户名或密码错误',
      };
    }
    const tokens = await this.generateToken(userInfo.id, userInfo.username);
    this.setCookie(res, tokens.refreshToken);
    return tokens.accessToken;
  }
  //手机号登录
  loginByPhoneEmail(user: LoginDto) {}

  //注册
  async registerUser() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const newUser = await this.prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    return newUser;
  }

  //   register(user: User) {
  //     return user;
  //   }
  //生成访问令牌和刷新令牌
  private async generateToken(id: string, username: string) {
    const accessToken: string = this.jwtService.sign({
      sub: id,
      username,
    });
    // 生成刷新令牌
    const refreshToken: string = uuidv4();
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() +
        parseInt(
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DAYS') || '7',
        ), // 7天有效期
    );
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        userId: id,
      },
    });
    return {
      accessToken,
      refreshToken,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      accessTokenExpiresIn:
        this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION') || '15m',
      refreshTokenExpiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DAYS') || '7'}d`,
    };
  }
  //刷新访问令牌
  async refreshAccessToken(refreshToken: string, res: ExpressResponse) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return {
        code: -1,
        message: 'refresh token expired',
      };
    }
    const tokens = await this.generateToken(
      tokenRecord.userId,
      // tokenRecord.user.username,
      tokenRecord.user.username,
    );
    await this.prisma.refreshToken.delete({
      where: {
        id: tokenRecord.id,
      },
    });
    this.setCookie(res, tokens.refreshToken);
    return tokens.accessToken;
  }
  // 注销 - 使刷新令牌失效
  async logout(refreshToken: string) {
    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
    return { message: '成功注销' };
  }
}
