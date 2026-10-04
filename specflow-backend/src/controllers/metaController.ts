import type { NextFunction, Request, Response } from 'express'
import { listUsers } from '../services/authService'
import { getDashboard } from '../services/dashboardService'
import { listMentionable } from '../services/mentionService'
import { actorFrom } from '../utils/actor'
import { sendData } from '../utils/http'

export async function users(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50
    const limit = Number.isFinite(limitRaw) ? limitRaw : 50
    sendData(res, await listUsers(q, limit))
  } catch (error) {
    next(error)
  }
}

export async function mentionable(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await listMentionable())
  } catch (error) {
    next(error)
  }
}

export async function dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await getDashboard(actorFrom(req)))
  } catch (error) {
    next(error)
  }
}
