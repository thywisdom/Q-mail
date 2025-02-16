import { defineStore } from 'pinia'
import api from '@/utils/axios'
import { PiniaPluginContext } from 'pinia'
import createAuthRefreshInterceptor from 'axios-auth-refresh'

interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
}

interface User {
  id: string
  email: string
  name: string
  email_confirmed_at?: string
}

interface AuthState {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: (): AuthState => ({
    user: null,
    session: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isInitialized: (state) => !state.loading,
    userEmail: (state) => state.user?.email
  },

  actions: {
    startLoading() {
      this.loading = true
    },

    stopLoading() {
      this.loading = false
    },

    // Setup axios interceptor for token refresh
    setupRefreshInterceptor() {
      createAuthRefreshInterceptor(api, async (failedRequest) => {
        const success = await this.refreshToken()
        if (success && this.session) {
          failedRequest.response.config.headers['Authorization'] = 
            `Bearer ${this.session.access_token}`
          return Promise.resolve()
        }
        return Promise.reject(failedRequest)
      }, {
        statusCodes: [401]
      })
    },

    async login(email: string, password: string) {
      try {
        const { data } = await api.post<{ user: User; session: AuthSession }>('/api/auth/signin', { 
          email, 
          password 
        })
        
        if (!data.user.email_confirmed_at) {
          throw new Error('Please verify your email address')
        }

        this.setSession(data.session)
        this.setUser(data.user)
        return data
      } catch (error: any) {
        this.reset()
        const message = error.response?.data?.message || error.message || 'Login failed'
        throw new Error(message)
      }
    },

    async register(data: { email: string; password: string; name: string }) {
      try {
        const response = await api.post('/api/auth/signup', data)
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Registration failed')
      }
    },

    async logout() {
      try {
        if (this.session?.access_token) {
          await api.post('/api/auth/signout', null, {
            headers: {
              Authorization: `Bearer ${this.session.access_token}`
            }
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.reset()
        window.location.href = '/auth/login'
      }
    },

    async refreshToken() {
      if (!this.session?.refresh_token) return false
      
      try {
        const { data } = await api.post('/api/auth/refresh', {
          refresh_token: this.session.refresh_token
        })
        this.setSession(data.session)
        return true
      } catch {
        this.reset()
        return false
      }
    },

    setSession(session: AuthSession) {
      this.session = session
      this.isAuthenticated = true
      // Set auth header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
    },

    setUser(user: User) {
      this.user = user
    },

    reset() {
      this.user = null
      this.session = null
      this.isAuthenticated = false
      delete api.defaults.headers.common['Authorization']
      // Clear any other auth-related state here
    },

    async loginWithGoogle() {
      try {
        const { data } = await api.get('/api/auth/google/signin')
        if (data?.url) {
          window.location.href = data.url
        }
        return data
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || 'Google sign in failed'
        throw new Error(message)
      }
    },

    async initializeAuth() {
      try {
        // First try to restore from persisted state
        if (this.session?.access_token) {
          const { data } = await api.get('/api/auth/session', {
            headers: {
              Authorization: `Bearer ${this.session.access_token}`
            }
          })
          
          if (data.user) {
            this.setUser(data.user)
            this.isAuthenticated = true
            return true
          }
        }

        // If session token is invalid or expired, try refresh token
        if (this.session?.refresh_token) {
          const success = await this.refreshToken()
          if (success) return true
        }

        this.reset()
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
          this.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token || '',
            expires_at: Date.now() + 3600000
          })
          const { data: userData } = await api.get('/api/auth/google/user', {
            headers: {
              Authorization: `Bearer ${params.access_token}`
            }
          })
          data = userData
        } else if (params.code) {
          const { data: authData } = await api.post('/api/auth/google/callback', { code: params.code })
          data = authData
          this.setSession({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: Date.now() + 3600000
          })
        } else {
          throw new Error('Invalid callback parameters')
        }

        this.setUser(data.user)
        this.isAuthenticated = true
        
        // Redirect to home page after successful authentication
        window.location.href = '/'
        return data
      } catch (error: any) {
        console.error('Google callback error:', error)
        window.location.href = '/auth/login?error=google-signin-failed'
        throw new Error('Failed to complete Google sign in')
      }
    },

    async requestPasswordReset(email: string) {
      try {
        const response = await api.post('/api/auth/forgot-password', { email })
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to send reset instructions')
      }
    },

    async verifyResetCode(email: string, code: string) {
      try {
        const response = await api.post('/api/auth/verify-reset-code', { email, code })
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Invalid reset code')
      }
    },

    async resetPassword(password: string, token: string) {
      try {
        const response = await api.post('/api/auth/reset-password', 
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
    storage: localStorage
  }
}) 