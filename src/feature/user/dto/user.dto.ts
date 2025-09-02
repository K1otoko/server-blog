enum userRole {
  admin = 'ADMIN',
  user = 'USER',
  moderator = 'MODERATOR',
}
export class userInfoDto {
  id: string;
  username: string;
  email?: string;
  password: string;
  name?: string;
  role: userRole;
  avatar?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
