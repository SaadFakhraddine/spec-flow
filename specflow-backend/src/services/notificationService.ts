import { Notification } from '../models/Notification'
import { Spec } from '../models/Spec'
import { Task } from '../models/Task'
import { User } from '../models/User'
import type { Actor, NotificationPreferences } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { mapId } from '../utils/mappers'
import { normalizePreferences } from '../utils/preferences'

export interface NotificationDto {
  id: string
  type: string
  message: string
  taskId: string | null
  specId: string | null
  readAt: string | null
  createdAt: string
}

type PrefKey = keyof NotificationPreferences

const TYPE_PREF: Record<string, PrefKey> = {
  'task.assigned': 'taskAssigned',
  'comment.created': 'commentCreated',
  'mention.created': 'mentionCreated',
  'task.status': 'taskStatus',
}

function toDto(doc: {
  _id: unknown
  id?: string
  type: string
  message: string
  taskId?: unknown
  specId?: unknown
  readAt?: Date | null
  createdAt?: Date
}): NotificationDto {
  return {
    id: doc.id ?? String(doc._id),
    type: doc.type,
    message: doc.message,
    taskId: doc.taskId ? String(doc.taskId) : null,
    specId: doc.specId ? String(doc.specId) : null,
    readAt: doc.readAt ? doc.readAt.toISOString() : null,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  }
}

async function filterRecipients(userIds: string[], type: string): Promise<string[]> {
  const prefKey = TYPE_PREF[type]
  if (!prefKey || userIds.length === 0) return userIds
  const users = await User.find({ _id: { $in: userIds } }).select('preferences')
  const allowed = new Set<string>()
  for (const user of users) {
    const prefs = normalizePreferences(user.preferences)
    if (prefs.notifications[prefKey]) allowed.add(user.id)
  }
  return userIds.filter((id) => allowed.has(id))
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
  const [allowed] = await filterRecipients([assigneeId], 'task.assigned')
  if (!allowed) return
  await Notification.create({
    userId: allowed,
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
  excludeIds: string[] = [],
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
  for (const id of excludeIds) recipients.delete(id)
  const allowed = await filterRecipients([...recipients], 'comment.created')
  if (allowed.length === 0) return
  await Notification.insertMany(
    allowed.map((userId) => ({
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
  const allowed = await filterRecipients([...recipients], 'task.status')
  if (allowed.length === 0) return
  await Notification.insertMany(
    allowed.map((userId) => ({
      userId,
      type: 'task.status',
      message: `"${task.title}" moved from ${from} to ${to}`,
      taskId,
    })),
  )
}

export async function notifyMentions(
  parentId: string,
  actorId: string,
  mentionIds: string[],
  preview: string,
  kind: 'task' | 'spec' = 'task',
): Promise<void> {
  if (!mentionIds.length) return
  const title =
    kind === 'task'
      ? (await Task.findById(parentId).select('title'))?.title
      : (await Spec.findById(parentId).select('title'))?.title
  if (!title) return
  const recipients = mentionIds.filter((id) => id !== actorId)
  const allowed = await filterRecipients(recipients, 'mention.created')
  if (!allowed.length) return
  await Notification.insertMany(
    allowed.map((userId) => ({
      userId,
      type: 'mention.created',
      message: `You were mentioned on "${title}": ${preview.slice(0, 80)}`,
      taskId: kind === 'task' ? parentId : null,
      specId: kind === 'spec' ? parentId : null,
    })),
  )
}

export async function notifySpecComment(
  specId: string,
  actorId: string,
  preview: string,
  excludeIds: string[] = [],
): Promise<void> {
  const spec = await Spec.findById(specId).select('title createdBy')
  if (!spec) return
  const creator = mapId(spec.createdBy)
  if (!creator || creator === actorId || excludeIds.includes(creator)) return
  const [allowed] = await filterRecipients([creator], 'comment.created')
  if (!allowed) return
  await Notification.create({
    userId: allowed,
    type: 'comment.created',
    message: `New comment on "${spec.title}": ${preview.slice(0, 80)}`,
    specId,
  })
}
