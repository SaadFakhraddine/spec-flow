import type { NextFunction, Request, Response } from 'express'
import * as specService from '../services/specService'
import type { SpecInput } from '../types/api.types'
import { actorFrom } from '../utils/actor'
import { sendData, sendPage } from '../utils/http'
import { readLimit, readPage } from '../utils/pagination'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await specService.getSpecs({ page: readPage(req.query.page), limit: readLimit(req.query.limit) })
    sendPage(res, result.data, result.total, result.page, result.limit)
  } catch (error) {
    next(error)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await specService.getSpecById(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await specService.createSpec(req.body as SpecInput, actorFrom(req)), 201)
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const spec = await specService.updateSpec(String(req.params.id), req.body as Partial<SpecInput>, actorFrom(req))
    sendData(res, spec)
  } catch (error) {
    next(error)
  }
}

export async function linkTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const taskId = String((req.body as { taskId: string }).taskId)
    sendData(res, await specService.addTaskToSpec(String(req.params.id), taskId, actorFrom(req)))
  } catch (error) {
    next(error)
  }
}
