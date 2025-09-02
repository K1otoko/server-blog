import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 继承 Passport 的 AuthGuard，并指定使用 'jwt' 策略
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
