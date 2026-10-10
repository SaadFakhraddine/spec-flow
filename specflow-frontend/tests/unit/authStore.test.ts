import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { clearAccessToken } from '@/utils/token'

vi.mock('@/composables/useApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  requestRefresh: vi.fn(),
  registerAuthHandlers: vi.fn(),
}))

const user = {
  id: '1',
  name: 'Ada',
  email: 'ada@specflow.dev',
  role: 'admin' as const,
  preferences: {
    theme: 'system' as const,
    density: 'comfortable' as const,
    notifications: {
      taskAssigned: true,
      commentCreated: true,
      mentionCreated: true,
      taskStatus: true,
    },
    defaults: {
      tasksView: 'list' as const,
      landingPage: 'dashboard' as const,
      tasksScope: 'all' as const,
    },
  },
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    clearAccessToken()
    localStorage.clear()
  })

  it('stores the session in memory after login', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, data: { accessToken: 'token', user } },
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const store = useAuthStore()
    await store.login('ada@specflow.dev', 'Password1')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.email).toBe('ada@specflow.dev')
    expect(setItem).not.toHaveBeenCalled()
  })

  it('clears the session on logout even if the request fails', async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        data: { success: true, data: { accessToken: 'token', user } },
      })
      .mockRejectedValueOnce(new Error('offline'))
    const store = useAuthStore()
    await store.login('ada@specflow.dev', 'Password1')
    await store.logout()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })
})
