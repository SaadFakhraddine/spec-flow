import type { RouteLocationNormalized } from 'vue-router'
import type { Role } from '@/types'

interface GuardInput {
  name: string
  public?: boolean
  admin?: boolean
}

export function decideRedirect(to: GuardInput, auth: { isAuthenticated: boolean; role?: Role }): string | true {
  if (to.public) {
    if (to.name === 'login' && auth.isAuthenticated) return '/dashboard'
    return true
  }
  if (!auth.isAuthenticated) return '/login'
  if (to.admin && auth.role !== 'admin') return '/dashboard'
  return true
}

export function guardInput(to: RouteLocationNormalized): GuardInput {
  return {
    name: String(to.name ?? ''),
    public: Boolean(to.meta.public),
    admin: Boolean(to.meta.admin),
  }
}
