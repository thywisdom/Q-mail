<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

const store = useNotificationStore()

const notifications = computed(() => store.notifications)

const getBackgroundColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50'
    case 'error':
      return 'bg-red-50'
    case 'warning':
      return 'bg-yellow-50'
    case 'info':
      return 'bg-blue-50'
    default:
      return 'bg-gray-50'
  }
}

const getTextColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    case 'info':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}
</script>

<template>
  <div class="fixed right-0 top-4 z-50 space-y-4 px-4">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          getBackgroundColor(notification.type),
          'w-96 rounded-lg p-4 shadow-lg'
        ]"
      >
        <div class="flex items-start">
          <div class="flex-1">
            <p :class="[getTextColor(notification.type), 'text-sm font-medium']">
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-4 flex flex-shrink-0">
            <button
              type="button"
              :class="[getTextColor(notification.type), 'hover:opacity-75']"
              @click="store.remove(notification.id)"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 