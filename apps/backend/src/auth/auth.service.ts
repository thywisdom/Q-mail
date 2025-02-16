import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SignUpDto, SignInDto, AuthResponseDto } from './dto/auth.dto';
import { RequestPasswordResetDto, VerifyResetCodeDto, ResetPasswordDto } from './dto/password-reset.dto';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class AuthService {
  private supabase;
  private rateLimiter;

  constructor(private configService: ConfigService) {
    // Initialize Supabase with anon key for auth
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_ANON_KEY')!
    );

    // Setup rate limiting
    this.rateLimiter = new RateLimiterMemory({
      points: 5, // Number of attempts
      duration: 60 // Per minute
    });
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

  async signIn(email: string, password: string) {
    try {
      await this.rateLimiter.consume(email);
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Add session management
      await this.supabase.from('user_sessions').insert({
        user_id: data.user.id,
        last_active: new Date()
      });

      return {
        user: data.user,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      };
    } catch (error) {
      if (error.name === 'RateLimiterError') {
        throw new UnauthorizedException('Too many login attempts. Please try again later.');
      }
      throw error;
    }
  }

  async signOut(token: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.admin.signOut(token)
      if (error) throw error

      // Get user from token
      const { data: { user } } = await this.supabase.auth.getUser(token)
      if (user) {
        // Update last active time
        await this.supabase
          .from('users')
          .update({ last_active_at: new Date() })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw new UnauthorizedException('Failed to sign out')
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
    try {
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      // Get or create user profile
      const { data: profile } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        user: {
          ...data.user,
          ...profile
        },
        session: data.session
      };
    } catch (error) {
      console.error('Google callback error:', error);
      throw new UnauthorizedException('Failed to complete Google authentication');
    }
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
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${this.configService.get('frontend.url')}/auth/reset-password`
      })

      if (error) throw error

      return {
        message: 'Password reset instructions have been sent to your email'
      }
    } catch (error) {
      console.error('Password reset request error:', error)
      throw new BadRequestException('Failed to send reset instructions')
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, token: string) {
    try {
      const { password } = resetPasswordDto
      const { error } = await this.supabase.auth.admin.updateUserById(
        token,
        { password }
      )

      if (error) throw error

      return {
        message: 'Password has been reset successfully'
      }
    } catch (error) {
      console.error('Password reset error:', error)
      throw new BadRequestException('Failed to reset password')
    }
  }
} 