import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/composables/useApi'
import { useTasksStore } from '@/stores/tasks'
import { filterTasks } from '@/utils/filters'
import type { Task } from '@/types'

vi.mock('@/composables/useApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  requestRefresh: vi.fn(),
  registerAuthHandlers: vi.fn(),
}))

const task = {
  id: 't1',
  title: 'Ship auth',
  description: '',
  status: 'backlog',
  priority: 'high',
  assignedTo: null,
  createdBy: { id: '1', name: 'Ada', email: 'ada@specflow.dev' },
  specId: null,
  tags: [],
  dueDate: null,
  watching: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-02T00:00:00.000Z',
} as Task

describe('tasks store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads a page of tasks', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { success: true, data: [task], total: 1, page: 1, limit: 10 } })
    const store = useTasksStore()
    await store.fetchTasks({ priority: 'high' }, 1)
    expect(store.tasks).toHaveLength(1)
    expect(store.total).toBe(1)
    expect(store.error).toBe('')
  })

  it('sets an error and does not throw when the request fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('offline'))
    const store = useTasksStore()
    await expect(store.fetchTasks({}, 1)).resolves.toBeUndefined()
    expect(store.error).toBe('Something went wrong')
  })
})

describe('filterTasks', () => {
  it('keeps tasks that match status and priority', () => {
    const second = { ...task, id: 't2', status: 'done' as const, priority: 'low' as const }
    const visible = filterTasks([task, second], { status: 'backlog', priority: 'high' })
    expect(visible.map((item) => item.id)).toEqual(['t1'])
  })
})
