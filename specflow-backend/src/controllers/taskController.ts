import type { NextFunction, Request, Response } from 'express'
import * as taskService from '../services/taskService'
import type { TaskInput, TaskPriority, TaskStatus } from '../types/api.types'
import { actorFrom } from '../utils/actor'
import { sendData, sendPage } from '../utils/http'
import { isTaskPriority, isTaskStatus } from '../utils/mappers'
import { readLimit, readPage, readText } from '../utils/pagination'

function filtersFrom(req: Request) {
  const status = readText(req.query.status)
  const priority = readText(req.query.priority)
  return {
    status: status && isTaskStatus(status) ? status as TaskStatus : undefined,
    priority: priority && isTaskPriority(priority) ? priority as TaskPriority : undefined,
    assignedTo: readText(req.query.assignedTo),
    q: readText(req.query.q),
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = { page: readPage(req.query.page), limit: readLimit(req.query.limit) }
    const result = await taskService.getTasks(filtersFrom(req), page)
    sendPage(res, result.data, result.total, result.page, result.limit)
  } catch (error) {
    next(error)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await taskService.getTaskById(String(req.params.id)))
  } catch (error) {
    next(error)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.createTask(req.body as TaskInput, actorFrom(req))
    sendData(res, task, 201)
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.updateTask(String(req.params.id), req.body as TaskInput, actorFrom(req))
    sendData(res, task)
  } catch (error) {
    next(error)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.deleteTask(String(req.params.id), actorFrom(req))
    sendData(res, null)
  } catch (error) {
    next(error)
  }
}

export async function assign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = String((req.body as { userId: string }).userId)
    const task = await taskService.assignTask(String(req.params.id), userId, actorFrom(req))
    sendData(res, task)
  } catch (error) {
    next(error)
  }
}
