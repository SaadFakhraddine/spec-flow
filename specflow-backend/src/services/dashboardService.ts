import { Task } from '../models/Task'
import { Spec } from '../models/Spec'
import type { Actor, DashboardDto, TaskDto } from '../types/api.types'
import { mapTaskSource } from '../utils/mappers'
import { startOfWeek } from '../utils/pagination'

const USER_FIELDS = 'name email'
const OPEN = { $ne: 'done' }
const BLOCKED = {
  $or: [
    { blockedReason: { $exists: true, $nin: [null, ''] } },
    { 'blockedBy.0': { $exists: true } },
  ],
}

function scopedOpen(actor: Actor): Record<string, unknown> {
  if (actor.role === 'admin') return { status: OPEN }
  return { status: OPEN, assignedTo: actor.id }
}

function withAssignee(actor: Actor, filter: Record<string, unknown>): Record<string, unknown> {
  if (actor.role === 'admin') return filter
  return { ...filter, assignedTo: actor.id }
}

async function countCompleted(actor: Actor, since: Date): Promise<number> {
  const filter: Record<string, unknown> = { status: 'done', updatedAt: { $gte: since } }
  if (actor.role !== 'admin') filter.assignedTo = actor.id
  return Task.countDocuments(filter)
}

async function recentTasks(): Promise<TaskDto[]> {
  const docs = await Task.find()
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('assignedTo', USER_FIELDS)
    .populate('createdBy', USER_FIELDS)
    .populate('blockedBy', 'title')
  return docs.map((doc) => mapTaskSource(doc))
}

export async function getDashboard(actor: Actor): Promise<DashboardDto> {
  const since = startOfWeek(new Date())
  const now = new Date()
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const [
    totalTasks,
    openTasks,
    specsInReview,
    completedThisWeek,
    overdueCount,
    dueSoonCount,
    blockedCount,
    unspeccedOpenCount,
    recentActivity,
  ] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments(scopedOpen(actor)),
    Spec.countDocuments({ status: 'in-review' }),
    countCompleted(actor, since),
    Task.countDocuments(withAssignee(actor, { status: OPEN, dueDate: { $ne: null, $lt: now } })),
    Task.countDocuments(
      withAssignee(actor, { status: OPEN, dueDate: { $ne: null, $gte: now, $lte: week } }),
    ),
    Task.countDocuments(withAssignee(actor, { status: OPEN, ...BLOCKED })),
    Task.countDocuments(withAssignee(actor, { status: OPEN, $or: [{ specId: null }, { specId: { $exists: false } }] })),
    recentTasks(),
  ])
  return {
    totalTasks,
    openTasks,
    specsInReview,
    completedThisWeek,
    overdueCount,
    dueSoonCount,
    blockedCount,
    unspeccedOpenCount,
    recentActivity,
  }
}
