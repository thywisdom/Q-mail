export class RequestPasswordResetDto {
  email: string;
}

export class VerifyResetCodeDto {
  email: string;
  code: string;
}

export class ResetPasswordDto {
  password: string;
} 