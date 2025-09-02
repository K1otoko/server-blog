import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const userSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserList() {
    return await this.prisma.user.findMany({
      select: userSelect,
    });
  }
}
