export class LoginDto {
  username: string;
  password: string;
  phoneEmail: string;
  code: string;
  method: 'username' | 'phone';
}
