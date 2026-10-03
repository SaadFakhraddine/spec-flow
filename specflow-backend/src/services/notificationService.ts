import { Notification } from '../models/Notification'
import { Task } from '../models/Task'
import type { Actor } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { mapId } from '../utils/mappers'

export interface NotificationDto {
  id: string
  type: string
  message: string
  taskId: string | null
  readAt: string | null
  createdAt: string
}

function toDto(doc: {
  _id: unknown
  id?: string
  type: string
  message: string
  taskId?: unknown
  readAt?: Date | null
  createdAt?: Date
}): NotificationDto {
  return {
    id: doc.id ?? String(doc._id),
    type: doc.type,
    message: doc.message,
    taskId: doc.taskId ? String(doc.taskId) : null,
    readAt: doc.readAt ? doc.readAt.toISOString() : null,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  }
}

export async function listNotifications(userId: string): Promise<NotificationDto[]> {
  const docs = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(40)
  return docs.map((doc) => toDto(doc))
}

export async function markRead(id: string, actor: Actor): Promise<NotificationDto> {
  const doc = await Notification.findById(id)
  if (!doc) throw new AppError('Notification not found', 404)
  if (mapId(doc.userId) !== actor.id) throw new AppError('Forbidden', 403)
  if (!doc.readAt) {
    doc.readAt = new Date()
    await doc.save()
  }
  return toDto(doc)
}

export async function markAllRead(actor: Actor): Promise<void> {
  await Notification.updateMany(
    { userId: actor.id, readAt: null },
    { $set: { readAt: new Date() } },
  )
}

export async function notifyAssignment(
  taskId: string,
  assigneeId: string,
  actorId: string,
  title: string,
): Promise<void> {
  if (assigneeId === actorId) return
  await Notification.create({
    userId: assigneeId,
    type: 'task.assigned',
    message: `You were assigned to "${title}"`,
    taskId,
  })
}

function watcherIds(watchers: unknown[] | undefined): string[] {
  if (!watchers?.length) return []
  return watchers.map((entry) => mapId(entry)).filter((id): id is string => Boolean(id))
}

export async function notifyComment(
  taskId: string,
  actorId: string,
  preview: string,
): Promise<void> {
  const task = await Task.findById(taskId).select('title assignedTo createdBy watchers')
  if (!task) return
  const recipients = new Set<string>()
  const assignee = mapId(task.assignedTo)
  const creator = mapId(task.createdBy)
  if (assignee) recipients.add(assignee)
  if (creator) recipients.add(creator)
  for (const id of watcherIds(task.watchers)) recipients.add(id)
  recipients.delete(actorId)
  if (recipients.size === 0) return
  await Notification.insertMany(
    [...recipients].map((userId) => ({
      userId,
      type: 'comment.created',
      message: `New comment on "${task.title}": ${preview.slice(0, 80)}`,
      taskId,
    })),
  )
}

export async function notifyStatusWatchers(
  taskId: string,
  actorId: string,
  from: string,
  to: string,
): Promise<void> {
  const task = await Task.findById(taskId).select('title watchers')
  if (!task) return
  const recipients = new Set(watcherIds(task.watchers))
  recipients.delete(actorId)
  if (recipients.size === 0) return
  await Notification.insertMany(
    [...recipients].map((userId) => ({
      userId,
      type: 'task.status',
      message: `"${task.title}" moved from ${from} to ${to}`,
      taskId,
    })),
  )
}
