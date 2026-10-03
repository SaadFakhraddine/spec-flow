import type { NextFunction, Request, Response } from 'express'
import * as savedFilterService from '../services/savedFilterService'
import { actorFrom } from '../utils/actor'
import { sendData } from '../utils/http'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await savedFilterService.listSavedFilters(actorFrom(req)))
  } catch (error) {
    next(error)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { name: string; query: savedFilterService.FilterQuery }
    const created = await savedFilterService.createSavedFilter(actorFrom(req), body.name, body.query)
    sendData(res, created, 201)
  } catch (error) {
    next(error)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await savedFilterService.deleteSavedFilter(String(req.params.id), actorFrom(req))
    sendData(res, null)
  } catch (error) {
    next(error)
  }
}
