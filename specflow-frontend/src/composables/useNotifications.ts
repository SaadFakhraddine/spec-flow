import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'

const POLL_MS = 30_000

export function useNotifications(poll = false) {
  const store = useNotificationsStore()
  let timer: ReturnType<typeof setInterval> | undefined

  if (poll) {
    onMounted(() => {
      void store.fetchNotifications()
      timer = setInterval(() => {
        void store.fetchNotifications()
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
