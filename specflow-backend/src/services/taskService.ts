import { Spec } from '../models/Spec'
import { Task } from '../models/Task'
import type { Actor, Page, TaskDto, TaskFilters, TaskInput } from '../types/api.types'
import { assertAdmin } from '../utils/actor'
import { AppError } from '../utils/AppError'
import { DEFAULT_CHECKLIST } from '../utils/checklist'
import { mapId, mapTaskSource } from '../utils/mappers'
import { escapeRegex } from '../utils/pagination'
import { applyBlockedFilter, applyDueFilter, TASK_USER_FIELDS } from '../utils/taskQuery'
import { recordActivity } from './activityService'
import { notifyAssignment, notifyStatusWatchers } from './notificationService'
import { adminPatch, developerPatch } from './taskPatch'

function populateTask<T extends {
  populate: (path: string, select: string) => T
}>(query: T): T {
  return query
    .populate('assignedTo', TASK_USER_FIELDS)
    .populate('createdBy', TASK_USER_FIELDS)
    .populate('blockedBy', 'title')
}

function assertCanDeveloperPatch(task: { assignedTo?: unknown }, actor: Actor): void {
  if (actor.role === 'admin') return
  if (mapId(task.assignedTo) !== actor.id) {
    throw new AppError('You can only update tasks assigned to you', 403)
  }
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
  assertCanDeveloperPatch(task, actor)
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
