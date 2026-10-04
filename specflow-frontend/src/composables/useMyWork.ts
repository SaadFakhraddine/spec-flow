import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, MyWorkDto } from '@/types'
import { errorMessage } from '@/utils/errors'

const empty: MyWorkDto = {
  assigned: [],
  watching: [],
  mentioned: [],
  blocked: [],
  overdue: [],
}

export function useMyWork() {
  const work = ref<MyWorkDto>(empty)
  const isLoading = ref(false)
  const error = ref('')

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      const response = await apiClient.get<ApiResponse<MyWorkDto>>('/me/work')
      work.value = response.data.data
    } catch (err) {
      error.value = errorMessage(err)
      work.value = empty
    } finally {
      isLoading.value = false
    }
  }

  return { work, isLoading, error, load }
}
