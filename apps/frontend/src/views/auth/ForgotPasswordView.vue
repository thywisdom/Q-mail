<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormNotification from '@/components/FormNotification.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: ''
})

const loading = ref(false)
const notification = ref<{ type: 'success' | 'error'; message: string; autoDismiss?: boolean } | null>(null)

const handleRequestReset = async () => {
  if (!form.value.email.trim()) {
    notification.value = { type: 'error', message: 'Email is required', autoDismiss: false }
    return
  }

  try {
    loading.value = true
    await authStore.requestPasswordReset(form.value.email)
    
    notification.value = {
      type: 'success',
      message: 'Password reset instructions have been sent to your email',
      autoDismiss: true
    }

    // Clear the form
    form.value.email = ''
  } catch (err: any) {
    notification.value = {
      type: 'error',
      message: err.message || 'Failed to send reset instructions',
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
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
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

        <form class="space-y-6" @submit.prevent="handleRequestReset">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                type="email"
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
            {{ loading ? 'Sending...' : 'Send Reset Instructions' }}
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <router-link
              to="/auth/login"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 