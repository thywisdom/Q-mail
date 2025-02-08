<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    // Get the hash fragment from the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    // If we have tokens in the URL hash
    if (accessToken) {
      await authStore.handleGoogleCallback({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      router.push('/')
      return
    }

    // Check for error parameters
    const error = hashParams.get('error')
    if (error) {
      throw new Error(error)
    }

    // Check for code in query parameters (fallback)
    const queryParams = new URLSearchParams(window.location.search)
    const code = queryParams.get('code')
    if (code) {
      await authStore.handleGoogleCallback({ code })
      router.push('/')
      return
    }

    throw new Error('No authentication data received')
  } catch (error: any) {
    console.error('Auth callback error:', error)
    router.push({
      path: '/auth/login',
      query: { error: error.message }
    })
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <h2 class="text-lg font-semibold text-gray-900">Processing your sign in...</h2>
      <p class="mt-2 text-sm text-gray-500">Please wait while we complete the authentication.</p>
    </div>
  </div>
</template> 