import type { RouteLocationNormalized } from 'vue-router'
import type { LandingPagePref, Role } from '@/types'
import { landingPath } from '@/utils/landing'

interface GuardInput {
  name: string
  public?: boolean
  admin?: boolean
}

export function decideRedirect(
  to: GuardInput,
  auth: { isAuthenticated: boolean; role?: Role; landingPage?: LandingPagePref },
): string | true {
  if (to.public) {
    if (to.name === 'login' && auth.isAuthenticated) return landingPath(auth.landingPage)
    return true
  }
  if (!auth.isAuthenticated) return '/login'
  if (to.admin && auth.role !== 'admin') return landingPath(auth.landingPage)
  return true
}

export function guardInput(to: RouteLocationNormalized): GuardInput {
  return {
    name: String(to.name ?? ''),
    public: Boolean(to.meta.public),
    admin: Boolean(to.meta.admin),
  }
}
