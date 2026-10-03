import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, UserRef } from '@/types'
import { errorMessage } from '@/utils/errors'

export function useMentionable() {
  const users = ref<UserRef[]>([])
  const error = ref('')

  async function load(): Promise<void> {
    try {
      const response = await apiClient.get<ApiResponse<UserRef[]>>('/users/mentionable')
      users.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
    }
  }

  return { users, error, load }
}
