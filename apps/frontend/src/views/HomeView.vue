<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <AppLayout>
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h2 class="text-base font-semibold leading-6 text-gray-900">
          Welcome {{ authStore.user?.name }}
        </h2>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
          <p>Your secure email dashboard.</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template> 