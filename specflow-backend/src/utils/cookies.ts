import { serialize } from 'cookie'
import type { Response } from 'express'
import { env } from '../config/env'

const COOKIE = 'refreshToken'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Prefer first-party cookies when the SPA proxies `/api` on the same origin (Vercel rewrite).
 * Set REFRESH_COOKIE_FIRST_PARTY=true on the API in that setup.
 * Otherwise use SameSite=None; Secure; Partitioned for direct cross-site calls.
 */
function serializeRefreshCookie(token: string, maxAgeSeconds: number): string {
  const production = env.NODE_ENV === 'production'
  const firstParty = env.REFRESH_COOKIE_FIRST_PARTY
  if (!production) {
    return serialize(COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    })
  }
  if (firstParty) {
    return serialize(COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    })
  }
  return serialize(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: maxAgeSeconds,
    partitioned: true,
  })
}

export function setRefreshCookie(res: Response, token: string): void {
  res.setHeader('Set-Cookie', serializeRefreshCookie(token, Math.floor(WEEK_MS / 1000)))
}

export function clearRefreshCookie(res: Response): void {
  res.setHeader('Set-Cookie', serializeRefreshCookie('', 0))
}

export const REFRESH_COOKIE = COOKIE
