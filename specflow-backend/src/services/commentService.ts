import { Comment } from '../models/Comment'
import { Task } from '../models/Task'
import type { Actor, UserRef } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { mapUser, requireUser } from '../utils/mappers'
import { recordActivity } from './activityService'
import { notifyComment } from './notificationService'

const USER_FIELDS = 'name email'

export interface CommentDto {
  id: string
  taskId: string
  body: string
  author: UserRef
  createdAt: string
  updatedAt: string
}

function toDto(doc: {
  _id: unknown
  id?: string
  taskId: unknown
  body: string
  authorId: unknown
  createdAt?: Date
  updatedAt?: Date
}): CommentDto {
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : new Date()
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : createdAt
  return {
    id: doc.id ?? String(doc._id),
    taskId: String(doc.taskId),
    body: doc.body,
    author: requireUser(doc.authorId, 'Comment author'),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }
}

async function assertTask(taskId: string): Promise<void> {
  const exists = await Task.exists({ _id: taskId })
  if (!exists) throw new AppError('Task not found', 404)
}

export async function listComments(taskId: string): Promise<CommentDto[]> {
  await assertTask(taskId)
  const docs = await Comment.find({ taskId }).sort({ createdAt: 1 }).populate('authorId', USER_FIELDS)
  return docs.map((doc) => toDto(doc))
}

export async function createComment(taskId: string, body: string, actor: Actor): Promise<CommentDto> {
  await assertTask(taskId)
  const trimmed = body.trim()
  const created = await Comment.create({ taskId, authorId: actor.id, body: trimmed })
  await recordActivity({
    actorId: actor.id,
    type: 'comment.created',
    taskId,
    meta: { preview: trimmed.slice(0, 80) },
  })
  await notifyComment(taskId, actor.id, trimmed)
  const doc = await Comment.findById(created.id).populate('authorId', USER_FIELDS)
  if (!doc) throw new AppError('Comment not found', 404)
  return toDto(doc)
}

export async function deleteComment(taskId: string, commentId: string, actor: Actor): Promise<void> {
  const comment = await Comment.findOne({ _id: commentId, taskId }).populate('authorId', USER_FIELDS)
  if (!comment) throw new AppError('Comment not found', 404)
  const author = mapUser(comment.authorId)
  const isOwner = author?.id === actor.id
  if (!isOwner && actor.role !== 'admin') {
    throw new AppError('You can only delete your own comments', 403)
  }
  await comment.deleteOne()
}
