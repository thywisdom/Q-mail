<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormNotification from '@/components/FormNotification.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const notification = ref<{ type: 'success' | 'error' | 'warning' | 'info'; message: string; autoDismiss?: boolean } | null>(null)

function validateForm() {
  if (!form.value.email.trim()) {
    notification.value = { type: 'error', message: 'Email is required', autoDismiss: false }
    return false
  }

  if (!form.value.password.trim()) {
    notification.value = { type: 'error', message: 'Password is required', autoDismiss: false }
    return false
  }

  return true
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  await handleLogin()
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    notification.value = null
    
    await authStore.login(form.value.email, form.value.password)
    
    notification.value = { 
      type: 'success', 
      message: 'Successfully signed in',
      autoDismiss: true
    }

    setTimeout(() => {
      if (notification.value?.type === 'success') {
        router.push('/')
      }
    }, 1500)
  } catch (err: any) {
    // Clear the form password on error
    form.value.password = ''
    
    notification.value = { 
      type: 'error', 
      message: err.message || 'Login failed',
      autoDismiss: false
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    notification.value = null
    const response = await authStore.loginWithGoogle()
    if (response?.url) {
      window.location.href = response.url
    }
  } catch (err: any) {
    notification.value = { 
      type: 'error', 
      message: err.message,
      autoDismiss: false 
    }
  } finally {
    loading.value = false
  }
}

function clearNotification() {
  notification.value = null
}
</script>

<template>
  <div class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <FormNotification
          v-if="notification"
          :type="notification.type"
          :message="notification.message"
          :auto-dismiss="notification.autoDismiss"
          @close="clearNotification"
        />

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="flex items-center justify-end">
            <div class="text-sm">
              <router-link 
                to="/auth/forgot-password" 
                class="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </router-link>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div class="mt-6">
            <button
              type="button"
              @click="handleGoogleLogin"
              class="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Prevent any form-related animations/transitions */
form {
  animation: none !important;
  transition: none !important;
}

/* Add this to prevent any unwanted form behaviors */
form * {
  pointer-events: auto !important;
}

/* Ensure notifications stay visible */
.notification {
  z-index: 50;
  position: relative;
}
</style> 