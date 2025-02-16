import { Controller, Post, Body, Get, UseGuards, Req, HttpCode, HttpStatus, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { RequestPasswordResetDto, VerifyResetCodeDto, ResetPasswordDto } from './dto/password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() userData: SignUpDto) {
    return this.authService.signUp(userData);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() credentials: { email: string; password: string }) {
    return this.authService.signIn(credentials.email, credentials.password);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Headers('authorization') auth: string) {
    try {
      const token = auth?.split(' ')[1]
      if (!token) {
        throw new UnauthorizedException('No token provided')
      }
      await this.authService.signOut(token)
      return { success: true }
    } catch (error) {
      throw new UnauthorizedException('Failed to sign out')
    }
  }

  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user?.id;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.authService.getUserProfile(userId);
  }

  @Get('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth() {
    try {
      const data = await this.authService.signInWithGoogle();
      return data;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  }

  @Get('google/signin')
  @HttpCode(HttpStatus.OK)
  async googleSignIn() {
    try {
      const data = await this.authService.signInWithGoogle({
        options: {
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
          redirectTo: `${this.configService.get('FRONTEND_URL')}/auth/callback`
        }
      });
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  @Get('google/user')
  async getGoogleUser(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '')
    if (!token) {
      throw new UnauthorizedException('No token provided')
    }
    return this.authService.getUserFromToken(token)
  }

  @Post('google/callback')
  async googleCallback(@Body('code') code: string) {
    return this.authService.handleGoogleCallback(code)
  }

  @Get('session')
  async verifySession(@Headers('authorization') auth: string) {
    try {
      const token = auth?.replace('Bearer ', '')
      if (!token) {
        throw new UnauthorizedException('No token provided')
      }
      return this.authService.verifySession(token)
    } catch (error) {
      throw new UnauthorizedException('Invalid session')
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() { email }: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers('authorization') auth: string
  ) {
    const token = auth?.split(' ')[1]
    if (!token) {
      throw new UnauthorizedException('No token provided')
    }
    return this.authService.resetPassword(resetPasswordDto, token)
  }
} 