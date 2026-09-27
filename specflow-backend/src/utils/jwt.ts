import jwt, { type JwtPayload } from 'jsonwebtoken'
import { env } from '../config/env'
import type { Role } from '../types/api.types'
import { AppError } from './AppError'

interface TokenClaims extends JwtPayload {
  role?: string
  tv?: number
}

export interface AccessPayload {
  sub: string
  role: Role
}

export interface RefreshPayload {
  sub: string
  tv: number
}

function readPayload(token: string, secret: string): TokenClaims {
  try {
    const payload = jwt.verify(token, secret)
    if (typeof payload === 'string') throw new AppError('Invalid or expired token', 401)
    return payload as TokenClaims
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Invalid or expired token', 401)
  }
}

export function generateAccessToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, { expiresIn: '15m' })
}

export function generateRefreshToken(userId: string, tokenVersion: number): string {
  return jwt.sign({ sub: userId, tv: tokenVersion }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): AccessPayload {
  const payload = readPayload(token, env.JWT_SECRET)
  const role = payload.role
  if (!payload.sub || (role !== 'admin' && role !== 'developer')) {
    throw new AppError('Invalid or expired token', 401)
  }
  return { sub: payload.sub, role }
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const payload = readPayload(token, env.JWT_REFRESH_SECRET)
  if (!payload.sub || typeof payload.tv !== 'number') {
    throw new AppError('Invalid or expired token', 401)
  }
  return { sub: payload.sub, tv: payload.tv }
}
