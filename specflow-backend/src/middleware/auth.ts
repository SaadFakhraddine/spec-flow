import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError'
import { verifyAccessToken } from '../utils/jwt'

function attachUser(req: Request): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError('Authentication required', 401)
  const token = header.slice('Bearer '.length).trim()
  if (!token) throw new AppError('Authentication required', 401)
  const payload = verifyAccessToken(token)
  req.user = { id: payload.sub, role: payload.role }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    attachUser(req)
    next()
  } catch (error) {
    next(error)
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, (error?: unknown) => {
    if (error) {
      next(error as Error)
      return
    }
    if (req.user?.role !== 'admin') {
      next(new AppError('Admin access required', 403))
      return
    }
    next()
  })
}
