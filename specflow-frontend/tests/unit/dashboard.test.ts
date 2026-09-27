import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/composables/useApi'
import { useDashboard } from '@/composables/useDashboard'

vi.mock('@/composables/useApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  requestRefresh: vi.fn(),
  registerAuthHandlers: vi.fn(),
}))

describe('useDashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads summary stats', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: { totalTasks: 4, openTasks: 2, specsInReview: 1, completedThisWeek: 1, recentActivity: [] },
      },
    })
    const dashboard = useDashboard()
    await dashboard.load()
    expect(dashboard.stats.value?.totalTasks).toBe(4)
    expect(dashboard.error.value).toBe('')
  })
})
