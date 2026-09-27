import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { decideRedirect } from '@/router/guard'
import { routes } from '@/router'

vi.mock('@/composables/useApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  requestRefresh: vi.fn().mockRejectedValue(new Error('no session')),
  registerAuthHandlers: vi.fn(),
}))

describe('route guard', () => {
  it('sends guests to login and signed-in users away from it', () => {
    expect(decideRedirect({ name: 'tasks' }, { isAuthenticated: false })).toBe('/login')
    expect(decideRedirect({ name: 'login', public: true }, { isAuthenticated: true, role: 'developer' })).toBe('/dashboard')
    expect(decideRedirect({ name: 'spec-new', admin: true }, { isAuthenticated: true, role: 'developer' })).toBe('/dashboard')
  })

  it('routes unknown paths to the 404 view', async () => {
    setActivePinia(createPinia())
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/missing-page')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
