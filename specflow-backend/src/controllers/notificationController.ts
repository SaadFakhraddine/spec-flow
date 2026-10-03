import type { NextFunction, Request, Response } from 'express'
import * as notificationService from '../services/notificationService'
import { actorFrom } from '../utils/actor'
import { sendData } from '../utils/http'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await notificationService.listNotifications(actorFrom(req).id))
  } catch (error) {
    next(error)
  }
}

export async function readOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await notificationService.markRead(String(req.params.id), actorFrom(req)))
  } catch (error) {
    next(error)
  }
}

export async function readAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllRead(actorFrom(req))
    sendData(res, null)
  } catch (error) {
    next(error)
  }
}
