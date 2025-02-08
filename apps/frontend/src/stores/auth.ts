import { defineStore } from 'pinia'
import api from '@/utils/axios'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  refreshToken: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    refreshToken: null
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const response = await api.post('/auth/signin', { email, password })
        
        if (!response.data.user.email_confirmed_at) {
          throw new Error('Please verify your email address')
        }

        this.token = response.data.session?.access_token
        this.user = response.data.user
        this.isAuthenticated = true
        
        return response.data
      } catch (error: any) {
        this.reset()
        
        const message = error.response?.data?.message 
          || error.message 
          || 'Invalid email or password'
        throw new Error(message)
      }
    },

    async register(data: { email: string; password: string; name: string }) {
      try {
        const response = await api.post('/auth/signup', data)
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Registration failed')
      }
    },

    async logout() {
      try {
        await api.post('/auth/signout')
        this.reset()
      } catch (error) {
        throw new Error('Failed to sign out')
      }
    },

    reset() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.refreshToken = null
    },

    async loginWithGoogle() {
      try {
        const response = await api.get('/auth/google/signin')
        return response.data
      } catch (error: any) {
        throw new Error('Google sign in failed')
      }
    },

    async initializeAuth() {
      try {
        if (this.token) {
          const response = await api.get('/auth/session', {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          })
          if (response.data.user) {
            this.user = response.data.user
            this.isAuthenticated = true
            return true
          }
        }
        return false
      } catch (error) {
        this.reset()
        return false
      }
    },

    async handleGoogleCallback(params: { code?: string; access_token?: string; refresh_token?: string }) {
      try {
        let data;
        
        if (params.access_token) {
          this.token = params.access_token
          this.refreshToken = params.refresh_token || null
          const response = await api.get('/auth/google/user', {
            headers: {
              Authorization: `Bearer ${params.access_token}`
            }
          })
          data = response.data
        } else if (params.code) {
          const response = await api.post('/auth/google/callback', { code: params.code })
          data = response.data
          this.token = data.session.access_token
          this.refreshToken = data.session.refresh_token
        } else {
          throw new Error('Invalid callback parameters')
        }

        this.user = data.user
        this.isAuthenticated = true
        return data
      } catch (error: any) {
        console.error('Google callback error:', error)
        throw new Error('Failed to complete Google sign in')
      }
    },

    async requestPasswordReset(email: string) {
      try {
        const response = await api.post('/auth/forgot-password', { email })
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to send reset instructions')
      }
    },

    async verifyResetCode(email: string, code: string) {
      try {
        const response = await api.post('/auth/verify-reset-code', { email, code })
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Invalid reset code')
      }
    },

    async resetPassword(password: string, token: string) {
      try {
        const response = await api.post('/auth/reset-password', 
          { password },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to reset password')
      }
    }
  },

  persist: {
    key: 'q-mail-auth',
    storage: localStorage,
    paths: ['token', 'refreshToken', 'user', 'isAuthenticated'],
    beforeRestore: (context) => {
      console.log('Restoring auth state:', context)
    },
    afterRestore: (context) => {
      console.log('Restored auth state:', context)
    }
  }
}) 