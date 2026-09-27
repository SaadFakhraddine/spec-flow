import type { Request } from 'express'
import type { Actor } from '../types/api.types'
import { AppError } from './AppError'

export function actorFrom(req: Request): Actor {
  if (!req.user) throw new AppError('Authentication required', 401)
  return { id: req.user.id, role: req.user.role }
}

export function assertAdmin(actor: Actor): void {
  if (actor.role !== 'admin') throw new AppError('Admin access required', 403)
}
