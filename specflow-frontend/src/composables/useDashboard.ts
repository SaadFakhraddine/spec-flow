import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, DashboardStats, User } from '@/types'
import { errorMessage } from '@/utils/errors'

export function useDashboard() {
  const stats = ref<DashboardStats | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard')
      stats.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
    } finally {
      isLoading.value = false
    }
  }

  return { stats, isLoading, error, load }
}

export function useUsers() {
  const users = ref<User[]>([])
  const error = ref('')

  async function load(): Promise<void> {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>('/users')
      users.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
    }
  }

  return { users, error, load }
}
