import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, AppNotification } from '@/types'
import { errorMessage } from '@/utils/errors'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const error = ref('')
  const unreadCount = computed(() => items.value.filter((item) => !item.readAt).length)

  async function fetchNotifications(): Promise<void> {
    error.value = ''
    try {
      const response = await apiClient.get<ApiResponse<AppNotification[]>>('/notifications')
      items.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
    }
  }

  async function markRead(id: string): Promise<void> {
    try {
      const response = await apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`)
      items.value = items.value.map((item) => (item.id === id ? response.data.data : item))
    } catch (caught) {
      error.value = errorMessage(caught)
    }
  }

  async function markAllRead(): Promise<void> {
    try {
      await apiClient.post('/notifications/read-all')
      const now = new Date().toISOString()
      items.value = items.value.map((item) => ({ ...item, readAt: item.readAt ?? now }))
    } catch (caught) {
      error.value = errorMessage(caught)
    }
  }

  return { items, error, unreadCount, fetchNotifications, markRead, markAllRead }
})
