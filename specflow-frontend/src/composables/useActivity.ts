import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ActivityItem, ApiResponse } from '@/types'
import { errorMessage } from '@/utils/errors'

export function useActivity() {
  const items = ref<ActivityItem[]>([])
  const isLoading = ref(false)
  const error = ref('')

  async function loadForTask(taskId: string): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      const response = await apiClient.get<ApiResponse<ActivityItem[]>>(`/tasks/${taskId}/activity`)
      items.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function loadRecent(): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      const response = await apiClient.get<ApiResponse<ActivityItem[]>>('/dashboard/activity')
      items.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { items, isLoading, error, loadForTask, loadRecent }
}
