import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class SessionService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService
  ) {}

  async trackSession(userId: string, sessionId: string) {
    const supabase = this.supabaseService.getClient()
    
    await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        last_active: new Date(),
        expires_at: new Date(Date.now() + this.configService.get('auth.sessionDuration') * 1000)
      })
  }
} 