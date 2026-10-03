import type { NextFunction, Request, Response } from 'express'
import * as commentService from '../services/commentService'
import { actorFrom } from '../utils/actor'
import { sendData } from '../utils/http'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await commentService.listComments({ kind: 'task', taskId: String(req.params.id) }))
  } catch (error) {
    next(error)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = String((req.body as { body: string }).body)
    const comment = await commentService.createComment(
      { kind: 'task', taskId: String(req.params.id) },
      body,
      actorFrom(req),
    )
    sendData(res, comment, 201)
  } catch (error) {
    next(error)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await commentService.deleteComment(
      { kind: 'task', taskId: String(req.params.id) },
      String(req.params.commentId),
      actorFrom(req),
    )
    sendData(res, null)
  } catch (error) {
    next(error)
  }
}

export async function listForSpec(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await commentService.listComments({ kind: 'spec', specId: String(req.params.id) }))
  } catch (error) {
    next(error)
  }
}

export async function createForSpec(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = String((req.body as { body: string }).body)
    const comment = await commentService.createComment(
      { kind: 'spec', specId: String(req.params.id) },
      body,
      actorFrom(req),
    )
    sendData(res, comment, 201)
  } catch (error) {
    next(error)
  }
}

export async function removeForSpec(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await commentService.deleteComment(
      { kind: 'spec', specId: String(req.params.id) },
      String(req.params.commentId),
      actorFrom(req),
    )
    sendData(res, null)
  } catch (error) {
    next(error)
  }
}
