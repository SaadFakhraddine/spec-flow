import { Activity } from '../models/Activity'
import { Notification } from '../models/Notification'
import { Task } from '../models/Task'
import { User } from '../models/User'
import type { PublicUser } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { requireUser } from '../utils/mappers'
import { normalizePreferences } from '../utils/preferences'
import { BLOCKED_TASK_OR } from '../utils/taskQuery'
import type { ActivityDto } from './activityService'

export interface ProfileStats {
  openAssigned: number
  watching: number
  unreadNotifications: number
  blockedAssigned: number
}

export interface ProfileDto {
  user: PublicUser
  stats: ProfileStats
  recent: ActivityDto[]
}

function toPublic(user: {
  id: string
  name: string
  email: string
  role: PublicUser['role']
  preferences?: Parameters<typeof normalizePreferences>[0]
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: normalizePreferences(user.preferences),
  }
}

function mapActivity(doc: {
  _id: unknown
  id?: string
  type: ActivityDto['type']
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

export async function getProfile(userId: string): Promise<ProfileDto> {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404)

  const [openAssigned, watching, unreadNotifications, blockedAssigned, recentDocs] =
    await Promise.all([
      Task.countDocuments({ assignedTo: userId, status: { $ne: 'done' } }),
      Task.countDocuments({ watchers: userId, status: { $ne: 'done' } }),
      Notification.countDocuments({ userId, readAt: null }),
      Task.countDocuments({
        assignedTo: userId,
        status: { $ne: 'done' },
        $or: [...BLOCKED_TASK_OR],
      }),
      Activity.find({
        $or: [{ actorId: userId }, { type: 'task.assigned', 'meta.userId': userId }],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('actorId', 'name email'),
    ])

  return {
    user: toPublic({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
    }),
    stats: { openAssigned, watching, unreadNotifications, blockedAssigned },
    recent: recentDocs.map((doc) => mapActivity(doc)),
  }
}
