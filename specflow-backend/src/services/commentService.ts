import { Comment } from '../models/Comment'
import { Spec } from '../models/Spec'
import { Task } from '../models/Task'
import type { Actor, UserRef } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { mapId, mapUser, requireUser } from '../utils/mappers'
import { recordActivity } from './activityService'
import { resolveMentions } from './mentionService'
import { notifyComment, notifyMentions, notifySpecComment } from './notificationService'

const USER_FIELDS = 'name email'

export type CommentParent = { kind: 'task'; taskId: string } | { kind: 'spec'; specId: string }

export interface CommentDto {
  id: string
  taskId: string | null
  specId: string | null
  body: string
  author: UserRef
  mentions: string[]
  createdAt: string
  updatedAt: string
}

function toDto(doc: {
  _id: unknown
  id?: string
  taskId?: unknown
  specId?: unknown
  body: string
  authorId: unknown
  mentions?: unknown[]
  createdAt?: Date
  updatedAt?: Date
}): CommentDto {
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : new Date()
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : createdAt
  return {
    id: doc.id ?? String(doc._id),
    taskId: doc.taskId ? String(doc.taskId) : null,
    specId: doc.specId ? String(doc.specId) : null,
    body: doc.body,
    author: requireUser(doc.authorId, 'Comment author'),
    mentions: (doc.mentions ?? []).map((id) => mapId(id)).filter((id): id is string => Boolean(id)),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }
}

async function assertParent(parent: CommentParent): Promise<void> {
  if (parent.kind === 'task') {
    if (!(await Task.exists({ _id: parent.taskId }))) throw new AppError('Task not found', 404)
    return
  }
  if (!(await Spec.exists({ _id: parent.specId }))) throw new AppError('Spec not found', 404)
}

function filter(parent: CommentParent): Record<string, string> {
  return parent.kind === 'task' ? { taskId: parent.taskId } : { specId: parent.specId }
}

export async function listComments(parent: CommentParent): Promise<CommentDto[]> {
  await assertParent(parent)
  const docs = await Comment.find(filter(parent)).sort({ createdAt: 1 }).populate('authorId', USER_FIELDS)
  return docs.map((doc) => toDto(doc))
}

export async function createComment(
  parent: CommentParent,
  body: string,
  actor: Actor,
): Promise<CommentDto> {
  await assertParent(parent)
  const trimmed = body.trim()
  const mentions = await resolveMentions(trimmed)
  const created = await Comment.create({ ...filter(parent), authorId: actor.id, body: trimmed, mentions })
  await recordActivity({
    actorId: actor.id,
    type: 'comment.created',
    taskId: parent.kind === 'task' ? parent.taskId : undefined,
    specId: parent.kind === 'spec' ? parent.specId : undefined,
    meta: { preview: trimmed.slice(0, 80) },
  })
  if (parent.kind === 'task') {
    await notifyMentions(parent.taskId, actor.id, mentions, trimmed)
    await notifyComment(parent.taskId, actor.id, trimmed, mentions)
  } else {
    await notifyMentions(parent.specId, actor.id, mentions, trimmed, 'spec')
    await notifySpecComment(parent.specId, actor.id, trimmed, mentions)
  }
  const doc = await Comment.findById(created.id).populate('authorId', USER_FIELDS)
  if (!doc) throw new AppError('Comment not found', 404)
  return toDto(doc)
}

export async function deleteComment(
  parent: CommentParent,
  commentId: string,
  actor: Actor,
): Promise<void> {
  const comment = await Comment.findOne({ _id: commentId, ...filter(parent) }).populate(
    'authorId',
    USER_FIELDS,
  )
  if (!comment) throw new AppError('Comment not found', 404)
  const author = mapUser(comment.authorId)
  if (author?.id !== actor.id && actor.role !== 'admin') {
    throw new AppError('You can only delete your own comments', 403)
  }
  await comment.deleteOne()
}
