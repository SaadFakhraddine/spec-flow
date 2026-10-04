import type { NextFunction, Request, Response } from 'express'
import * as myWorkService from '../services/myWorkService'
import { sendData } from '../utils/http'

export async function getMyWork(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const work = await myWorkService.getMyWork(req.user?.id ?? '')
    sendData(res, work)
  } catch (error) {
    next(error)
  }
}
