<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/solid'
import { onMounted, watch, onUnmounted } from 'vue'

const props = defineProps<{
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  autoDismiss?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

let dismissTimer: number | undefined

function startDismissTimer() {
  if (props.autoDismiss && props.type === 'success') {
    dismissTimer = window.setTimeout(() => {
      emit('close')
    }, 3000)
  }
}

function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = undefined
  }
}

// Watch for changes in message to reset timer
watch(() => props.message, () => {
  clearDismissTimer()
  startDismissTimer()
})

onMounted(() => {
  startDismissTimer()
})

// Clean up timer on unmount
onUnmounted(() => {
  clearDismissTimer()
})

const getIcon = () => {
  switch (props.type) {
    case 'success':
      return CheckCircleIcon
    case 'error':
      return ExclamationCircleIcon
    case 'warning':
      return ExclamationCircleIcon
    case 'info':
      return InformationCircleIcon
  }
}

const getColors = () => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 text-green-800'
    case 'error':
      return 'bg-red-50 text-red-800'
    case 'warning':
      return 'bg-yellow-50 text-yellow-800'
    case 'info':
      return 'bg-blue-50 text-blue-800'
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
    @after-leave="$emit('close')"
  >
    <div :class="['rounded-md p-4 mb-4', getColors()]">
      <div class="flex">
        <div class="flex-shrink-0">
          <component :is="getIcon()" class="h-5 w-5" aria-hidden="true" />
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">{{ message }}</p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              type="button"
              :class="[
                'inline-flex rounded-md p-1.5',
                'hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2'
              ]"
              @click="emit('close')"
            >
              <span class="sr-only">Dismiss</span>
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style> 