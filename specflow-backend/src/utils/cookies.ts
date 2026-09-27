import type { Response } from 'express'
import { env } from '../config/env'

const COOKIE = 'refreshToken'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function cookieOptions(maxAge: number) {
  const production = env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? ('none' as const) : ('lax' as const),
    maxAge,
    path: '/',
  }
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(COOKIE, token, cookieOptions(WEEK_MS))
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(COOKIE, cookieOptions(0))
}

export const REFRESH_COOKIE = COOKIE
