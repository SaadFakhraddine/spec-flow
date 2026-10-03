import { Activity, type ActivityType } from '../models/Activity'
import type { UserRef } from '../types/api.types'
import { requireUser } from '../utils/mappers'

const USER_FIELDS = 'name email'

export interface ActivityDto {
  id: string
  type: ActivityType
  taskId: string | null
  specId: string | null
  meta: Record<string, unknown>
  actor: UserRef
  createdAt: string
}

interface RecordInput {
  actorId: string
  type: ActivityType
  taskId?: string | null
  specId?: string | null
  meta?: Record<string, unknown>
}

export async function recordActivity(input: RecordInput): Promise<void> {
  await Activity.create({
    actorId: input.actorId,
    type: input.type,
    taskId: input.taskId ?? null,
    specId: input.specId ?? null,
    meta: input.meta ?? {},
  })
}

function mapDoc(doc: {
  _id: unknown
  id?: string
  type: ActivityType
  taskId?: unknown
  specId?: unknown
  meta?: Record<string, unknown>
  actorId: unknown
  createdAt?: Date
}): ActivityDto {
  return {
    id: doc.id ?? String(doc._id),
    type: doc.type,
    taskId: doc.taskId ? String(doc.taskId) : null,
    specId: doc.specId ? String(doc.specId) : null,
    meta: doc.meta ?? {},
    actor: requireUser(doc.actorId, 'Activity actor'),
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  }
}

export async function listTaskActivity(taskId: string, limit = 30): Promise<ActivityDto[]> {
  const docs = await Activity.find({ taskId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actorId', USER_FIELDS)
  return docs.map((doc) => mapDoc(doc))
}

export async function listRecentActivity(limit = 15): Promise<ActivityDto[]> {
  const docs = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actorId', USER_FIELDS)
  return docs.map((doc) => mapDoc(doc))
}
