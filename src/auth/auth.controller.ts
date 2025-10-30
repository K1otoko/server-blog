import { Body, Controller, Get, Post, Response } from '@nestjs/common';
import type { Request, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { isProd } from 'src/utils/common';

interface Token {
  refreshToken: string;
  accessToken: string;
}

/**
 * 认证控制器
 * 处理用户登录、刷新令牌等认证相关请求
 */
@Controller('admin/auth')
export class AuthController {
  /**
   * 构造函数，注入AuthService服务
   * @param authService - 认证服务实例，用于处理具体的认证逻辑
   */
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginParams: LoginDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<any> {
    return await this.authService.login(loginParams, res);
  }
  @Post('refresh')
  async refresh(
    @Body() { refreshToken }: { refreshToken: string },
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<any> {
    return await this.authService.refreshAccessToken(refreshToken, res);
  }
  @Get('register')
  async register(): Promise<any> {
    return await this.authService.registerUser();
  }
}
