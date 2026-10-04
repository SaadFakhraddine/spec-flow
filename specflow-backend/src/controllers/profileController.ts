import type { NextFunction, Request, Response } from 'express'
import * as profileService from '../services/profileService'
import { sendData } from '../utils/http'

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await profileService.getProfile(req.user?.id ?? '')
    sendData(res, profile)
  } catch (error) {
    next(error)
  }
}
