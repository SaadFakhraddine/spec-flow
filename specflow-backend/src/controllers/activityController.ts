import type { NextFunction, Request, Response } from 'express'
import * as activityService from '../services/activityService'
import { sendData } from '../utils/http'

export async function listForTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await activityService.listTaskActivity(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export async function listRecent(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await activityService.listRecentActivity())
  } catch (error) {
    next(error)
  }
}
