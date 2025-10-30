export class LoginDto {
  username: string;
  password: string;
  phoneEmail: string;
  code: string;
  method: 'username' | 'phone';
}
export class RegisterDto {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
}
