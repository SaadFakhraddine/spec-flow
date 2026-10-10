import { serialize } from 'cookie'
import type { Response } from 'express'
import { env } from '../config/env'

const COOKIE = 'refreshToken'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Cross-site (Vercel UI → Render API) needs SameSite=None; Secure.
 * Partitioned (CHIPS) keeps the cookie usable as browsers block unpartitioned third-party cookies.
 */
function serializeRefreshCookie(token: string, maxAgeSeconds: number): string {
  const production = env.NODE_ENV === 'production'
  return serialize(COOKIE, token, {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
    ...(production ? { partitioned: true } : {}),
  })
}

export function setRefreshCookie(res: Response, token: string): void {
  res.setHeader('Set-Cookie', serializeRefreshCookie(token, Math.floor(WEEK_MS / 1000)))
}

export function clearRefreshCookie(res: Response): void {
  res.setHeader('Set-Cookie', serializeRefreshCookie('', 0))
}

export const REFRESH_COOKIE = COOKIE
