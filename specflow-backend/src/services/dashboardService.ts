import { Task } from '../models/Task'
import { Spec } from '../models/Spec'
import type { Actor, DashboardDto, TaskDto } from '../types/api.types'
import { mapTaskSource } from '../utils/mappers'
import { startOfWeek } from '../utils/pagination'

const USER_FIELDS = 'name email'
const OPEN = { $ne: 'done' }

function openFilter(actor: Actor): Record<string, unknown> {
  if (actor.role === 'admin') return { status: OPEN }
  return { status: OPEN, assignedTo: actor.id }
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
  return docs.map((doc) => mapTaskSource(doc))
}

export async function getDashboard(actor: Actor): Promise<DashboardDto> {
  const since = startOfWeek(new Date())
  const [totalTasks, openTasks, specsInReview, completedThisWeek, recentActivity] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments(openFilter(actor)),
    Spec.countDocuments({ status: 'in-review' }),
    countCompleted(actor, since),
    recentTasks(),
  ])
  return { totalTasks, openTasks, specsInReview, completedThisWeek, recentActivity }
}
