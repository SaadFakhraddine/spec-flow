import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'

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
  preferences: { theme: 'system' as const, accent: 'teal' as const, density: 'comfortable' as const },
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('stores the session in memory after login', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, data: { accessToken: 'token', user } },
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const store = useAuthStore()
    await store.login('ada@specflow.dev', 'Password1')
    expect(store.accessToken).toBe('token')
    expect(store.isAuthenticated).toBe(true)
    expect(setItem).not.toHaveBeenCalled()
  })

  it('clears the session on logout even if the request fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('offline'))
    const store = useAuthStore()
    store.accessToken = 'token'
    await store.logout()
    expect(store.accessToken).toBe('')
    expect(store.user).toBeNull()
  })
})
