import { Spec } from '../models/Spec'
import { Task } from '../models/Task'
import type { Actor, Page, TaskDto, TaskFilters, TaskInput } from '../types/api.types'
import { assertAdmin } from '../utils/actor'
import { AppError } from '../utils/AppError'
import { mapId, mapTaskSource } from '../utils/mappers'
import { escapeRegex } from '../utils/pagination'
import { recordActivity } from './activityService'
import { DEFAULT_CHECKLIST } from '../utils/checklist'
import { notifyAssignment, notifyStatusWatchers } from './notificationService'
import { adminPatch, developerPatch } from './taskPatch'

const USER_FIELDS = 'name email'

function populateTask<T extends {
  populate: (path: string, select: string) => T
}>(query: T): T {
  return query
    .populate('assignedTo', USER_FIELDS)
    .populate('createdBy', USER_FIELDS)
    .populate('blockedBy', 'title')
}

function applyBlockedFilter(query: Record<string, unknown>, blocked?: boolean): void {
  if (blocked !== true) return
  const blockedOr = [
    { blockedReason: { $exists: true, $nin: [null, ''] } },
    { 'blockedBy.0': { $exists: true } },
  ]
  const existingAnd = Array.isArray(query.$and) ? (query.$and as unknown[]) : []
  if (query.$or) {
    existingAnd.push({ $or: query.$or })
    delete query.$or
  }
  existingAnd.push({ $or: blockedOr })
  query.$and = existingAnd
  query.status = query.status ?? { $ne: 'done' }
}

function applyDueFilter(query: Record<string, unknown>, due?: 'overdue' | 'soon'): void {
  if (!due) return
  const now = new Date()
  if (due === 'overdue') {
    query.dueDate = { $ne: null, $lt: now }
    query.status = query.status ?? { $ne: 'done' }
    return
  }
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  query.dueDate = { $ne: null, $gte: now, $lte: week }
  query.status = query.status ?? { $ne: 'done' }
}

export async function getTasks(filters: TaskFilters, pageQuery: Page, viewerId?: string) {
  const query: Record<string, unknown> = {}
  if (filters.status) query.status = filters.status
  if (filters.priority) query.priority = filters.priority
  if (filters.assignedTo) query.assignedTo = filters.assignedTo
  if (filters.q) {
    const pattern = { $regex: escapeRegex(filters.q), $options: 'i' }
    query.$or = [{ title: pattern }, { description: pattern }, { tags: pattern }]
  }
  applyDueFilter(query, filters.due)
  applyBlockedFilter(query, filters.blocked)
  const skip = (pageQuery.page - 1) * pageQuery.limit
  const [items, total] = await Promise.all([
    populateTask(Task.find(query).sort({ updatedAt: -1 }).skip(skip).limit(pageQuery.limit)),
    Task.countDocuments(query),
  ])
  return {
    data: items.map((item) => mapTaskSource(item, viewerId)),
    total,
    page: pageQuery.page,
    limit: pageQuery.limit,
  }
}

export async function getTaskById(id: string, viewerId?: string): Promise<TaskDto> {
  const task = await populateTask(Task.findById(id))
  if (!task) throw new AppError('Task not found', 404)
  return mapTaskSource(task, viewerId)
}

async function linkSpec(taskId: unknown, specId: string | null | undefined): Promise<void> {
  if (!specId) return
  const spec = await Spec.findById(specId)
  if (!spec) throw new AppError('Spec not found', 404)
  await Spec.findByIdAndUpdate(specId, { $addToSet: { tasks: taskId } })
}

export async function createTask(input: TaskInput, actor: Actor): Promise<TaskDto> {
  assertAdmin(actor)
  const task = await Task.create({
    title: input.title,
    description: input.description ?? '',
    status: input.status ?? 'backlog',
    priority: input.priority ?? 'medium',
    assignedTo: input.assignedTo ?? null,
    createdBy: actor.id,
    specId: input.specId ?? null,
    tags: input.tags ?? [],
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item })),
    blockedReason: '',
    blockedBy: [],
    externalUrl: '',
  })
  await linkSpec(task._id, input.specId)
  await recordActivity({
    actorId: actor.id,
    type: 'task.created',
    taskId: task.id,
    meta: { title: task.title },
  })
  return getTaskById(task.id, actor.id)
}

export async function updateTask(id: string, input: TaskInput, actor: Actor): Promise<TaskDto> {
  const task = await Task.findById(id)
  if (!task) throw new AppError('Task not found', 404)
  if (input.blockedBy?.includes(id)) {
    throw new AppError('A task cannot block itself', 400)
  }
  const previousStatus = task.status
  task.set(actor.role === 'admin' ? adminPatch(input) : developerPatch(input))
  await task.save()
  if (input.status && input.status !== previousStatus) {
    await recordActivity({
      actorId: actor.id,
      type: 'task.status',
      taskId: task.id,
      meta: { from: previousStatus, to: input.status },
    })
    await notifyStatusWatchers(task.id, actor.id, previousStatus, input.status)
  }
  return getTaskById(task.id, actor.id)
}

export async function deleteTask(id: string, actor: Actor): Promise<void> {
  const task = await Task.findById(id)
  if (!task) throw new AppError('Task not found', 404)
  if (actor.role !== 'admin' && mapId(task.createdBy) !== actor.id) {
    throw new AppError('You cannot delete this task', 403)
  }
  if (task.specId) await Spec.findByIdAndUpdate(task.specId, { $pull: { tasks: task._id } })
  await task.deleteOne()
}

export async function assignTask(taskId: string, userId: string, actor: Actor): Promise<TaskDto> {
  assertAdmin(actor)
  const task = await Task.findById(taskId)
  if (!task) throw new AppError('Task not found', 404)
  task.set('assignedTo', userId)
  await task.save()
  await recordActivity({
    actorId: actor.id,
    type: 'task.assigned',
    taskId: task.id,
    meta: { userId },
  })
  await notifyAssignment(task.id, userId, actor.id, task.title)
  return getTaskById(task.id, actor.id)
}
