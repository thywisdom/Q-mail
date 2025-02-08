export class SignUpDto {
  email: string;
  password: string;
  name?: string;
  profileImage?: string;
}

export class SignInDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: any;
  session: any;
  message?: string;
} 