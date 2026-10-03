import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, TaskFilters } from '@/types'
import { errorMessage } from '@/utils/errors'

export interface SavedFilter {
  id: string
  name: string
  resource: 'tasks'
  query: TaskFilters
  createdAt: string
}

export function useSavedFilters() {
  const items = ref<SavedFilter[]>([])
  const error = ref('')

  async function load(): Promise<void> {
    try {
      const response = await apiClient.get<ApiResponse<SavedFilter[]>>('/saved-filters')
      items.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
    }
  }

  async function save(name: string, query: TaskFilters): Promise<SavedFilter | null> {
    error.value = ''
    try {
      const response = await apiClient.post<ApiResponse<SavedFilter>>('/saved-filters', {
        name,
        query,
      })
      items.value = [...items.value, response.data.data].sort((a, b) => a.name.localeCompare(b.name))
      return response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
      return null
    }
  }

  async function remove(id: string): Promise<boolean> {
    error.value = ''
    try {
      await apiClient.delete(`/saved-filters/${id}`)
      items.value = items.value.filter((item) => item.id !== id)
      return true
    } catch (caught) {
      error.value = errorMessage(caught)
      return false
    }
  }

  return { items, error, load, save, remove }
}
