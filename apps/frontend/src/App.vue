<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationToast from '@/components/NotificationToast.vue'

const router = useRouter()
const authStore = useAuthStore()
const initialized = ref(false)

onMounted(async () => {
  try {
    // Check URL for auth callback parameters
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    
    const code = urlParams.get('code')
    const access_token = hashParams.get('access_token')
    const refresh_token = hashParams.get('refresh_token')

    if (code || access_token) {
      await authStore.handleGoogleCallback({ 
        code, 
        access_token, 
        refresh_token 
      })
      return
    }

    // Otherwise try to restore existing session
    const isAuthenticated = await authStore.initializeAuth()
    if (!isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
      router.push('/auth/login')
    }
  } catch (error) {
    console.error('Auth initialization error:', error)
  } finally {
    initialized.value = true
  }
})
</script>

<template>
  <NotificationToast />
  <RouterView v-if="initialized" />
  <div v-else class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <h2 class="text-lg font-semibold text-gray-900">Loading...</h2>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
