import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login() {
    return '登录成功';
  }
}
