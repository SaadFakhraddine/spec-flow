import type { NextFunction, Request, Response } from 'express'
import * as specService from '../services/specService'
import type { SpecInput } from '../types/api.types'
import { actorFrom } from '../utils/actor'
import { sendData, sendPage } from '../utils/http'
import { readLimit, readPage, readText } from '../utils/pagination'

function listFilters(req: Request) {
  const includeArchived =
    readText(req.query.includeArchived) === 'true' || readText(req.query.includeArchived) === '1'
  const archivedOnly =
    readText(req.query.archivedOnly) === 'true' || readText(req.query.archivedOnly) === '1'
  const needsTasks =
    readText(req.query.needsTasks) === 'true' || readText(req.query.needsTasks) === '1'
  return {
    status: readText(req.query.status),
    q: readText(req.query.q),
    includeArchived,
    archivedOnly,
    needsTasks,
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await specService.getSpecs(
      { page: readPage(req.query.page), limit: readLimit(req.query.limit) },
      listFilters(req),
    )
    sendPage(res, result.data, result.total, result.page, result.limit)
  } catch (error) {
    next(error)
  }
}

export async function exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const csv = await specService.exportSpecsCsv(listFilters(req))
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="specs.csv"')
    res.status(200).send(csv)
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
    const spec = await specService.updateSpec(
      String(req.params.id),
      req.body as Partial<SpecInput>,
      actorFrom(req),
    )
    sendData(res, spec)
  } catch (error) {
    next(error)
  }
}

export async function archive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await specService.setArchived(String(req.params.id), true, actorFrom(req)))
  } catch (error) {
    next(error)
  }
}

export async function unarchive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await specService.setArchived(String(req.params.id), false, actorFrom(req)))
  } catch (error) {
    next(error)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await specService.deleteSpec(String(req.params.id), actorFrom(req))
    sendData(res, null)
  } catch (error) {
    next(error)
  }
}

export async function revisions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await specService.listRevisions(String(req.params.id)))
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

export async function unlinkTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(
      res,
      await specService.unlinkTaskFromSpec(
        String(req.params.id),
        String(req.params.taskId),
        actorFrom(req),
      ),
    )
  } catch (error) {
    next(error)
  }
}
