import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type {
  ApiResponse,
  PaginatedResponse,
  Spec,
  SpecFilters,
  SpecForm,
  SpecRevision,
} from '@/types'
import { PAGE_LIMIT } from '@/types'
import { errorMessage } from '@/utils/errors'

const PIPELINE_LIMIT = 50

function cleanSpecFilters(filters: SpecFilters): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.status) params.status = filters.status
  if (filters.q) params.q = filters.q
  if (filters.includeArchived) params.includeArchived = 'true'
  if (filters.archivedOnly) params.archivedOnly = 'true'
  if (filters.needsTasks) params.needsTasks = 'true'
  return params
}

export const useSpecsStore = defineStore('specs', () => {
  const specs = ref<Spec[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const isLoading = ref(false)
  const error = ref('')
  const selectedSpec = ref<Spec | null>(null)
  const revisions = ref<SpecRevision[]>([])

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

  async function fetchSpecs(page: number, filters: SpecFilters = {}): Promise<void> {
    currentPage.value = page
    await run(async () => {
      const response = await apiClient.get<PaginatedResponse<Spec>>('/specs', {
        params: { ...cleanSpecFilters(filters), page, limit: PAGE_LIMIT },
      })
      specs.value = response.data.data
      total.value = response.data.total
    })
  }

  async function fetchPipeline(filters: SpecFilters = {}): Promise<void> {
    currentPage.value = 1
    await run(async () => {
      const response = await apiClient.get<PaginatedResponse<Spec>>('/specs', {
        params: { ...cleanSpecFilters(filters), page: 1, limit: PIPELINE_LIMIT },
      })
      specs.value = response.data.data
      total.value = response.data.total
    })
  }

  async function fetchSpecById(id: string): Promise<void> {
    await run(async () => {
      const response = await apiClient.get<ApiResponse<Spec>>(`/specs/${id}`)
      selectedSpec.value = response.data.data
    })
  }

  async function fetchRevisions(id: string): Promise<void> {
    try {
      const response = await apiClient.get<ApiResponse<SpecRevision[]>>(`/specs/${id}/revisions`)
      revisions.value = response.data.data
    } catch {
      revisions.value = []
    }
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

  async function archiveSpec(id: string): Promise<Spec | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Spec>>(`/specs/${id}/archive`)
      selectedSpec.value = response.data.data
      return response.data.data
    })
  }

  async function unarchiveSpec(id: string): Promise<Spec | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Spec>>(`/specs/${id}/unarchive`)
      selectedSpec.value = response.data.data
      return response.data.data
    })
  }

  async function deleteSpec(id: string): Promise<boolean> {
    const result = await run(async () => {
      await apiClient.delete(`/specs/${id}`)
      return true
    })
    return result === true
  }

  async function addTaskToSpec(specId: string, taskId: string): Promise<Spec | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Spec>>(`/specs/${specId}/tasks`, { taskId })
      selectedSpec.value = response.data.data
      return response.data.data
    })
  }

  async function unlinkTaskFromSpec(specId: string, taskId: string): Promise<Spec | null> {
    return run(async () => {
      const response = await apiClient.delete<ApiResponse<Spec>>(`/specs/${specId}/tasks/${taskId}`)
      selectedSpec.value = response.data.data
      return response.data.data
    })
  }

  async function exportCsv(filters: SpecFilters = {}): Promise<Blob | null> {
    return run(async () => {
      const response = await apiClient.get('/specs/export.csv', {
        params: cleanSpecFilters(filters),
        responseType: 'blob',
      })
      return response.data as Blob
    })
  }

  return {
    specs,
    total,
    currentPage,
    isLoading,
    error,
    selectedSpec,
    revisions,
    fetchSpecs,
    fetchPipeline,
    fetchSpecById,
    fetchRevisions,
    createSpec,
    updateSpec,
    archiveSpec,
    unarchiveSpec,
    deleteSpec,
    addTaskToSpec,
    unlinkTaskFromSpec,
    exportCsv,
  }
})
