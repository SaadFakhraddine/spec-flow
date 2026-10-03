import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse } from '@/types'
import { errorMessage } from '@/utils/errors'

export interface SearchHit {
  id: string
  title: string
  kind: 'task' | 'spec'
}

export function useSearch() {
  const tasks = ref<SearchHit[]>([])
  const specs = ref<SearchHit[]>([])
  const error = ref('')
  const isLoading = ref(false)

  async function search(q: string): Promise<void> {
    if (!q.trim()) {
      tasks.value = []
      specs.value = []
      return
    }
    isLoading.value = true
    error.value = ''
    try {
      const response = await apiClient.get<ApiResponse<{ tasks: SearchHit[]; specs: SearchHit[] }>>('/search', {
        params: { q },
      })
      tasks.value = response.data.data.tasks
      specs.value = response.data.data.specs
    } catch (caught) {
      error.value = errorMessage(caught)
      tasks.value = []
      specs.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { tasks, specs, error, isLoading, search }
}
