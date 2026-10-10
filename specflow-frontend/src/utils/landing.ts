import type { LandingPagePref } from '@/types'

const PATHS: Record<LandingPagePref, string> = {
  dashboard: '/dashboard',
  'my-work': '/my-work',
  tasks: '/tasks',
}

export function landingPath(page?: LandingPagePref | null): string {
  if (page && page in PATHS) return PATHS[page]
  return PATHS.dashboard
}
