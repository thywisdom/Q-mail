type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          display_name: string | null
          profile_image_url: string | null
          is_verified: boolean
          public_key: string | null
          last_login_at: string | null
          last_active_at: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          display_name?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          public_key?: string | null
          last_login_at?: string | null
          last_active_at?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          display_name?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          public_key?: string | null
          last_login_at?: string | null
          last_active_at?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      emails: {
        Row: {
          id: string
          sender_id: string
          subject: string
          content: string
          encrypted_key: string | null
          is_encrypted: boolean
          thread_id: string | null
          parent_email_id: string | null
          importance: 'low' | 'normal' | 'high'
          category: string
          read_receipt: boolean
          has_attachments: boolean
          is_draft: boolean
          is_scheduled: boolean
          scheduled_for: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          subject: string
          content: string
          encrypted_key?: string | null
          is_encrypted?: boolean
          thread_id?: string | null
          parent_email_id?: string | null
          importance?: 'low' | 'normal' | 'high'
          category?: string
          read_receipt?: boolean
          has_attachments?: boolean
          is_draft?: boolean
          is_scheduled?: boolean
          scheduled_for?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          subject?: string
          content?: string
          encrypted_key?: string | null
          is_encrypted?: boolean
          thread_id?: string | null
          parent_email_id?: string | null
          importance?: 'low' | 'normal' | 'high'
          category?: string
          read_receipt?: boolean
          has_attachments?: boolean
          is_draft?: boolean
          is_scheduled?: boolean
          scheduled_for?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... define other tables similarly
    }
  }
} 