import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, PaginatedResponse, Spec, SpecForm } from '@/types'
import { PAGE_LIMIT } from '@/types'
import { errorMessage } from '@/utils/errors'

export const useSpecsStore = defineStore('specs', () => {
  const specs = ref<Spec[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const isLoading = ref(false)
  const error = ref('')
  const selectedSpec = ref<Spec | null>(null)

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    isLoading.value = true
    error.value = ''
    try {
      return await action()
    } catch (caught) {
      error.value = errorMessage(caught)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSpecs(page: number): Promise<void> {
    currentPage.value = page
    await run(async () => {
      const response = await apiClient.get<PaginatedResponse<Spec>>('/specs', { params: { page, limit: PAGE_LIMIT } })
      specs.value = response.data.data
      total.value = response.data.total
    })
  }

  async function fetchSpecById(id: string): Promise<void> {
    selectedSpec.value = null
    await run(async () => {
      const response = await apiClient.get<ApiResponse<Spec>>(`/specs/${id}`)
      selectedSpec.value = response.data.data
    })
  }

  async function createSpec(data: SpecForm): Promise<Spec | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Spec>>('/specs', data)
      return response.data.data
    })
  }

  async function updateSpec(id: string, data: Partial<SpecForm>): Promise<Spec | null> {
    return run(async () => {
      const response = await apiClient.patch<ApiResponse<Spec>>(`/specs/${id}`, data)
      selectedSpec.value = response.data.data
      return response.data.data
    })
  }

  async function addTaskToSpec(specId: string, taskId: string): Promise<Spec | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Spec>>(`/specs/${specId}/tasks`, { taskId })
      selectedSpec.value = response.data.data
      return response.data.data
    })
  }

  return {
    specs,
    total,
    currentPage,
    isLoading,
    error,
    selectedSpec,
    fetchSpecs,
    fetchSpecById,
    createSpec,
    updateSpec,
    addTaskToSpec,
  }
})
