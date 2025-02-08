<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormNotification from '@/components/FormNotification.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  name: '',
  confirmPassword: ''
})

const loading = ref(false)
const notification = ref<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null)

function validateForm(e: Event) {
  e.preventDefault() // Prevent form submission
  
  if (!form.value.name.trim()) {
    notification.value = { type: 'error', message: 'Name is required' }
    return false
  }

  if (!form.value.email.trim()) {
    notification.value = { type: 'error', message: 'Email is required' }
    return false
  }

  if (form.value.password.length < 8) {
    notification.value = { type: 'error', message: 'Password must be at least 8 characters long' }
    return false
  }

  if (form.value.password !== form.value.confirmPassword) {
    notification.value = { type: 'error', message: 'Passwords do not match' }
    return false
  }

  return true
}

async function handleRegister(e: Event) {
  e.preventDefault() // Prevent form submission
  notification.value = null

  if (!validateForm(e)) {
    return
  }

  try {
    loading.value = true
    await authStore.register({
      email: form.value.email,
      password: form.value.password,
      name: form.value.name
    })
    notification.value = { 
      type: 'success', 
      message: 'Registration successful! Please check your email for verification.' 
    }
    // Only redirect after successful registration
    setTimeout(() => {
      if (notification.value?.type === 'success') {
        router.push('/auth/login')
      }
    }, 3000)
  } catch (err: any) {
    notification.value = { type: 'error', message: err.message }
  } finally {
    loading.value = false
  }
}

function clearNotification() {
  notification.value = null
}

const validatePassword = () => {
  if (form.value.password && form.value.password.length < 8) {
    notification.value = { type: 'warning', message: 'Password must be at least 8 characters long' }
  } else if (form.value.confirmPassword && form.value.password !== form.value.confirmPassword) {
    notification.value = { type: 'warning', message: 'Passwords do not match' }
  } else {
    notification.value = null
  }
}

// Watch for password changes
watch(() => form.value.password, validatePassword)
watch(() => form.value.confirmPassword, validatePassword)
</script>

<template>
  <div class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Create your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl shadow-indigo-50/50 sm:rounded-lg sm:px-10">
        <FormNotification
          v-if="notification"
          :type="notification.type"
          :message="notification.message"
          @close="clearNotification"
        />

        <form class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full name</label>
            <div class="mt-1">
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                required
                @blur="validatePassword"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm password</label>
            <div class="mt-1">
              <input
                id="confirm-password"
                v-model="form.confirmPassword"
                type="password"
                required
                @blur="validatePassword"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template> 