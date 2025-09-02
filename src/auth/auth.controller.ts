import { Body, Controller, Post, Response } from '@nestjs/common';
import type { Request, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { isProd } from 'src/utils/common';

interface Token {
  refreshToken: string;
  accessToken: string;
}

@Controller('auth')
export class AuthController {
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
}
