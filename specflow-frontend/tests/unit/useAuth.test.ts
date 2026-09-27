import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/composables/useAuth'
import apiClient from '@/composables/useApi'

vi.mock('@/composables/useApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  requestRefresh: vi.fn(),
  registerAuthHandlers: vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('returns false and a message when login fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValue({ response: { data: { message: 'Invalid email or password' } }, isAxiosError: true })
    const auth = useAuth()
    const ok = await auth.login('ada@specflow.dev', 'Password1')
    expect(ok).toBe(false)
    expect(auth.error.value.length).toBeGreaterThan(0)
  })
})
