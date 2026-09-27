import type { NextFunction, Request, Response } from 'express'
import { listUsers } from '../services/authService'
import { getDashboard } from '../services/dashboardService'
import { actorFrom } from '../utils/actor'
import { sendData } from '../utils/http'

export async function users(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await listUsers())
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
