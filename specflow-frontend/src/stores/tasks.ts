import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, PaginatedResponse, Task, TaskFilters, TaskInput, TaskStatus } from '@/types'
import { PAGE_LIMIT } from '@/types'
import { errorMessage } from '@/utils/errors'
import { taskStatuses } from '@/utils/status'

const BOARD_LIMIT = 50

function cleanFilters(filters: TaskFilters): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.assignedTo) params.assignedTo = filters.assignedTo
  if (filters.q) params.q = filters.q
  if (filters.due) params.due = filters.due
  if (filters.blocked) params.blocked = filters.blocked
  return params
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const isLoading = ref(false)
  const error = ref('')
  const selectedTask = ref<Task | null>(null)

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

  function remember(task: Task): void {
    selectedTask.value = task
    tasks.value = tasks.value.map((item) => (item.id === task.id ? task : item))
  }

  async function fetchTasks(filters: TaskFilters, page: number): Promise<void> {
    currentPage.value = page
    await run(async () => {
      const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
        params: { ...cleanFilters(filters), page, limit: PAGE_LIMIT },
      })
      tasks.value = response.data.data
      total.value = response.data.total
    })
  }

  async function fetchTaskById(id: string): Promise<void> {
    selectedTask.value = null
    await run(async () => {
      const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
      selectedTask.value = response.data.data
    })
  }

  async function createTask(data: TaskInput): Promise<Task | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Task>>('/tasks', data)
      return response.data.data
    })
  }

  async function updateTask(id: string, data: Partial<TaskInput>): Promise<Task | null> {
    return run(async () => {
      const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data)
      remember(response.data.data)
      return response.data.data
    })
  }

  async function patchTaskQuiet(id: string, data: Partial<TaskInput>): Promise<Task | null> {
    error.value = ''
    try {
      const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data)
      remember(response.data.data)
      return response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
      return null
    }
  }

  async function deleteTask(id: string): Promise<boolean> {
    const result = await run(async () => {
      await apiClient.delete(`/tasks/${id}`)
      tasks.value = tasks.value.filter((task) => task.id !== id)
      if (selectedTask.value?.id === id) selectedTask.value = null
      return true
    })
    return result === true
  }

  async function assignTask(taskId: string, userId: string): Promise<Task | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Task>>(`/tasks/${taskId}/assign`, { userId })
      remember(response.data.data)
      return response.data.data
    })
  }

  async function bulkUpdate(ids: string[], patch: { status?: TaskStatus; assignedTo?: string | null }): Promise<number | null> {
    return run(async () => {
      const response = await apiClient.patch<ApiResponse<{ updated: number }>>('/tasks/bulk', {
        ids,
        ...patch,
      })
      return response.data.data.updated
    })
  }

  async function watchTask(id: string): Promise<Task | null> {
    return run(async () => {
      const response = await apiClient.post<ApiResponse<Task>>(`/tasks/${id}/watch`)
      remember(response.data.data)
      return response.data.data
    })
  }

  async function unwatchTask(id: string): Promise<Task | null> {
    return run(async () => {
      const response = await apiClient.delete<ApiResponse<Task>>(`/tasks/${id}/watch`)
      remember(response.data.data)
      return response.data.data
    })
  }

  async function fetchBoardColumns(
    filters: Omit<TaskFilters, 'status'>,
  ): Promise<Record<TaskStatus, Task[]> | null> {
    return run(async () => {
      const base = cleanFilters(filters)
      const results = await Promise.all(
        taskStatuses.map(async (status) => {
          const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
            params: { ...base, status, page: 1, limit: BOARD_LIMIT },
          })
          return [status, response.data.data] as const
        }),
      )
      return Object.fromEntries(results) as Record<TaskStatus, Task[]>
    })
  }

  return {
    tasks,
    total,
    currentPage,
    isLoading,
    error,
    selectedTask,
    fetchTasks,
    fetchTaskById,
    fetchBoardColumns,
    createTask,
    updateTask,
    patchTaskQuiet,
    deleteTask,
    assignTask,
    bulkUpdate,
    watchTask,
    unwatchTask,
  }
})
