import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SignUpDto, SignInDto, AuthResponseDto } from './dto/auth.dto';
import { RequestPasswordResetDto, VerifyResetCodeDto, ResetPasswordDto } from './dto/password-reset.dto';

@Injectable()
export class AuthService {
  private supabase;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    try {
      const { email, password, name } = signUpDto;
      console.log('Starting signup process for:', email);

      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Validate password
      if (password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase.from('users').select('email').eq('email', email).single();

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const { data: { user, session }, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
        },
      });

      console.log('Supabase signup response:', { user, error });

      if (error) {
        console.error('Signup error:', error);
        throw new BadRequestException(error.message);
      }

      if (!user) {
        console.error('No user returned from signup');
        throw new BadRequestException('User registration failed');
      }

      console.log('Signup successful, verification email should be sent');

      return { 
        user, 
        session,
        message: 'Registration successful. Please check your email for verification.'
      };
    } catch (error) {
      console.error('Signup process error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async signIn(credentials: { email: string; password: string }) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async signOut(sessionId: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.signOut(sessionId);

    if (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase.from('users').select(`
      id,
      email,
      full_name,
      display_name,
      profile_image_url,
      is_verified,
      last_login_at,
      last_active_at,
      preferences,
      created_at,
      updated_at
    `).eq('id', userId).single();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async signInWithGoogle(options = {}) {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${this.configService.get('FRONTEND_URL')}/auth/callback`,
          ...options
        }
      });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return { url: data.url };
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async handleGoogleCallback(code: string) {
    const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async getUserFromToken(token: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(token)
    
    if (error) {
      throw new UnauthorizedException(error.message)
    }

    return { user }
  }

  async verifySession(token: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token)
      
      if (error) {
        throw new UnauthorizedException(error.message)
      }

      // Get additional user data if needed
      const { data: profile } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        user: {
          ...user,
          ...profile
        }
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid session')
    }
  }

  async requestPasswordReset(email: string) {
    try {
      // First verify the user exists in Supabase Auth
      const { data: { users }, error: userError } = await this.supabase.auth.admin
        .listUsers({
          filters: {
            email: email
          }
        });

      if (userError || !users?.length) {
        throw new BadRequestException('User not found');
      }

      // Use Supabase's built-in password reset
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${this.configService.get('FRONTEND_URL')}/auth/reset-password`
      });

      if (error) throw error;

      return { 
        message: 'Password reset instructions have been sent to your email'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to initiate password reset');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, token: string) {
    const { password } = resetPasswordDto;

    try {
      // Verify the token first
      const { data: { user }, error: verifyError } = await this.supabase.auth.getUser(token);
      
      if (verifyError || !user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Update password using Supabase Auth
      const { error } = await this.supabase.auth.admin.updateUserById(
        user.id,
        { password: password }
      );

      if (error) throw error;

      // Update last_login_at in our users table
      await this.supabase
        .from('users')
        .update({
          last_login_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', user.id);

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Reset password error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to reset password');
    }
  }
} 