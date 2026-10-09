import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/composables/useApi'
import { useSpecsStore } from '@/stores/specs'
import type { Spec } from '@/types'

vi.mock('@/composables/useApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  requestRefresh: vi.fn(),
  registerAuthHandlers: vi.fn(),
}))

const spec = {
  id: 's1',
  title: 'Auth',
  businessGoal: 'Stay signed in',
  technicalApproach: 'Rotate tokens',
  apiDesign: '',
  edgeCases: [],
  acceptanceCriteria: ['Refresh works'],
  regressionRisks: '',
  status: 'draft',
  archivedAt: null,
  approvedAt: null,
  approvedBy: null,
  createdBy: { id: '1', name: 'Ada', email: 'ada@specflow.dev' },
  tasks: [],
  taskCount: 0,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
} as Spec

describe('specs store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads specs', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { success: true, data: [spec], total: 1, page: 1, limit: 10 } })
    const store = useSpecsStore()
    await store.fetchSpecs(1)
    expect(store.specs[0]?.title).toBe('Auth')
  })

  it('returns null when create fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('nope'))
    const store = useSpecsStore()
    const created = await store.createSpec({
      title: 'Auth',
      businessGoal: 'Goal',
      technicalApproach: 'Plan',
      apiDesign: '',
      edgeCases: [],
      acceptanceCriteria: ['One'],
      regressionRisks: '',
      status: 'draft',
    })
    expect(created).toBeNull()
    expect(store.error).toBeTruthy()
  })
})
