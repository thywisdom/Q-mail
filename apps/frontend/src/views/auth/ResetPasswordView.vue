<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormNotification from '@/components/FormNotification.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const notification = ref<{ type: 'success' | 'error'; message: string; autoDismiss?: boolean } | null>(null)
const accessToken = ref('')

onMounted(async () => {
  // Get the token from URL parameters
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  accessToken.value = hashParams.get('access_token') || ''
  
  if (!accessToken.value) {
    notification.value = {
      type: 'error',
      message: 'Invalid or expired reset link. Please request a new one.',
      autoDismiss: false
    }
  }
})

const handleResetPassword = async () => {
  if (!accessToken.value) {
    notification.value = {
      type: 'error',
      message: 'Invalid reset link. Please request a new password reset.',
      autoDismiss: false
    }
    return
  }

  if (!form.value.password.trim()) {
    notification.value = { type: 'error', message: 'New password is required', autoDismiss: false }
    return
  }

  if (form.value.password.length < 8) {
    notification.value = { type: 'error', message: 'Password must be at least 8 characters', autoDismiss: false }
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    notification.value = { type: 'error', message: 'Passwords do not match', autoDismiss: false }
    return
  }

  try {
    loading.value = true
    await authStore.resetPassword(form.value.password, accessToken.value)
    
    notification.value = {
      type: 'success',
      message: 'Password has been reset successfully',
      autoDismiss: true
    }

    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } catch (err: any) {
    notification.value = {
      type: 'error',
      message: err.message || 'Failed to reset password',
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
        Reset Your Password
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

        <form class="space-y-6" @submit.prevent="handleResetPassword">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div class="mt-1">
              <input
                id="confirm-password"
                v-model="form.confirmPassword"
                type="password"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template> 