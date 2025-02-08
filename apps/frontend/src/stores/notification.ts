import { defineStore } from 'pinia'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timeout?: number
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[]
  }),

  actions: {
    show(type: Notification['type'], message: string, timeout = 5000) {
      const id = Date.now()
      this.notifications.push({ id, type, message })

      if (timeout) {
        setTimeout(() => {
          this.remove(id)
        }, timeout)
      }
    },

    remove(id: number) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    success(message: string) {
      this.show('success', message)
    },

    error(message: string) {
      this.show('error', message)
    },

    warning(message: string) {
      this.show('warning', message)
    },

    info(message: string) {
      this.show('info', message)
    }
  }
}) 