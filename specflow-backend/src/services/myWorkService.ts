import { Comment } from '../models/Comment'
import { Task } from '../models/Task'
import type { TaskDto } from '../types/api.types'
import { mapTaskSource } from '../utils/mappers'
import { BLOCKED_TASK_OR, TASK_USER_FIELDS } from '../utils/taskQuery'

const LIMIT = 5

export interface MyWorkDto {
  assigned: TaskDto[]
  watching: TaskDto[]
  mentioned: TaskDto[]
  blocked: TaskDto[]
  overdue: TaskDto[]
}

function populateTask<T extends {
  populate: (path: string, select: string) => T
}>(query: T): T {
  return query
    .populate('assignedTo', TASK_USER_FIELDS)
    .populate('createdBy', TASK_USER_FIELDS)
    .populate('blockedBy', 'title')
}

const blockedClause = { $or: [...BLOCKED_TASK_OR] }

async function mapTasks(docs: unknown[], viewerId: string): Promise<TaskDto[]> {
  return docs.map((doc) => mapTaskSource(doc, viewerId))
}

export async function getMyWork(userId: string): Promise<MyWorkDto> {
  const now = new Date()
  const open = { status: { $ne: 'done' as const } }

  const [assignedDocs, watchingDocs, mentionComments, blockedDocs, overdueDocs] =
    await Promise.all([
      populateTask(
        Task.find({ ...open, assignedTo: userId }).sort({ updatedAt: -1 }).limit(LIMIT),
      ),
      populateTask(
        Task.find({
          ...open,
          watchers: userId,
          assignedTo: { $ne: userId },
          // Blocked watch items live under Blocked — keep Watching shorter.
          blockedReason: { $in: [null, ''] },
          blockedBy: { $size: 0 },
        })
          .sort({ updatedAt: -1 })
          .limit(LIMIT),
      ),
      Comment.find({ mentions: userId, taskId: { $ne: null } })
        .sort({ createdAt: -1 })
        .limit(40)
        .select('taskId'),
      populateTask(
        Task.find({
          ...open,
          $and: [blockedClause, { $or: [{ assignedTo: userId }, { watchers: userId }] }],
        })
          .sort({ updatedAt: -1 })
          .limit(LIMIT),
      ),
      populateTask(
        Task.find({
          ...open,
          assignedTo: userId,
          dueDate: { $ne: null, $lt: now },
        })
          .sort({ dueDate: 1 })
          .limit(LIMIT),
      ),
    ])

  const mentionTaskIds = [
    ...new Set(
      mentionComments
        .map((doc) => (doc.taskId ? String(doc.taskId) : ''))
        .filter(Boolean),
    ),
  ].slice(0, LIMIT)

  const mentionedDocs =
    mentionTaskIds.length === 0
      ? []
      : await populateTask(Task.find({ _id: { $in: mentionTaskIds }, ...open }))

  const mentionedOrdered = mentionTaskIds
    .map((id) => mentionedDocs.find((doc) => doc.id === id))
    .filter((doc): doc is (typeof mentionedDocs)[number] => Boolean(doc))

  const [assigned, watching, mentioned, blocked, overdue] = await Promise.all([
    mapTasks(assignedDocs, userId),
    mapTasks(watchingDocs, userId),
    mapTasks(mentionedOrdered, userId),
    mapTasks(blockedDocs, userId),
    mapTasks(overdueDocs, userId),
  ])

  return { assigned, watching, mentioned, blocked, overdue }
}
