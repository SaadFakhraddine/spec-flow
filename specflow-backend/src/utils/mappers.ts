import type { SpecDto, TaskDto, TaskPriority, TaskStatus, UserRef } from '../types/api.types'
import { AppError } from './AppError'

interface MaybeUser {
  _id?: unknown
  id?: string
  name?: string
  email?: string
}

export function mapUser(value: unknown): UserRef | null {
  if (!value || typeof value !== 'object') return null
  const user = value as MaybeUser
  if (!user.name || !user.email) return null
  const id = user.id ?? (user._id ? String(user._id) : '')
  if (!id) return null
  return { id, name: user.name, email: user.email }
}

export function mapId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return String((value as { _id: unknown })._id)
  }
  return String(value)
}

export function requireUser(value: unknown, label: string): UserRef {
  const user = mapUser(value)
  if (!user) throw new AppError(`${label} is missing`, 500)
  return user
}

export function asStatus(value: string | undefined, allowed: readonly string[]): string | undefined {
  if (!value) return undefined
  return allowed.includes(value) ? value : undefined
}

export function isTaskStatus(value: string): value is TaskStatus {
  return value === 'backlog' || value === 'in-progress' || value === 'in-review' || value === 'done'
}

export function isTaskPriority(value: string): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high' || value === 'critical'
}

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

interface TaskSource {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: unknown
  createdBy: unknown
  specId?: unknown
  tags?: string[]
  dueDate?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export function mapTaskSource(value: unknown): TaskDto {
  const task = value as TaskSource
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    assignedTo: mapUser(task.assignedTo),
    createdBy: requireUser(task.createdBy, 'Task author'),
    specId: mapId(task.specId),
    tags: task.tags ?? [],
    dueDate: iso(task.dueDate),
    createdAt: iso(task.createdAt) ?? '',
    updatedAt: iso(task.updatedAt) ?? '',
  }
}

interface SpecSource {
  id: string
  title: string
  businessGoal: string
  technicalApproach: string
  apiDesign?: string
  edgeCases?: string[]
  acceptanceCriteria: string[]
  regressionRisks?: string
  status: SpecDto['status']
  createdBy: unknown
  tasks?: unknown[]
  createdAt: Date | string
  updatedAt: Date | string
}

export function mapSpecSource(value: unknown, tasks: TaskDto[]): SpecDto {
  const spec = value as SpecSource
  return {
    id: spec.id,
    title: spec.title,
    businessGoal: spec.businessGoal,
    technicalApproach: spec.technicalApproach,
    apiDesign: spec.apiDesign ?? '',
    edgeCases: spec.edgeCases ?? [],
    acceptanceCriteria: spec.acceptanceCriteria,
    regressionRisks: spec.regressionRisks ?? '',
    status: spec.status,
    createdBy: requireUser(spec.createdBy, 'Spec author'),
    tasks,
    taskCount: spec.tasks?.length ?? tasks.length,
    createdAt: iso(spec.createdAt) ?? '',
    updatedAt: iso(spec.updatedAt) ?? '',
  }
}
