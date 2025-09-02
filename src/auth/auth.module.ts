import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // 导入ConfigModule以获取环境变量
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // 从环境变量获取密钥
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION'), // 访问令牌过期时间
        },
      }),
      inject: [ConfigService], // 注入ConfigService
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
