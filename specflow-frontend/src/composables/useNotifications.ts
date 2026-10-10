import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const POLL_MS = 30_000

export function useNotifications(poll = false) {
  const store = useNotificationsStore()
  const auth = useAuthStore()
  let timer: ReturnType<typeof setInterval> | undefined

  if (poll) {
    onMounted(() => {
      if (!auth.isAuthenticated) return
      void store.fetchNotifications()
      timer = setInterval(() => {
        if (auth.isAuthenticated) void store.fetchNotifications()
      }, POLL_MS)
    })
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })
  }

  return {
    ...storeToRefs(store),
    fetchNotifications: store.fetchNotifications,
    markRead: store.markRead,
    markAllRead: store.markAllRead,
  }
}
