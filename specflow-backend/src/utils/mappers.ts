import type {
  ChecklistItemDto,
  SpecDto,
  SpecRevisionDto,
  SpecStatus,
  TaskDto,
  TaskPriority,
  TaskRef,
  TaskStatus,
  UserRef,
} from '../types/api.types'
import { AppError } from './AppError'
import { DEFAULT_CHECKLIST, normalizeChecklist } from './checklist'

export function mapId(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') return value
  // ObjectId / Buffer-like — prefer toString, never treat ObjectId.id (Buffer) as the id
  if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
    const doc = value as { _bsontype?: string; id?: unknown; _id?: unknown; toString?: () => string }
    if (doc._bsontype === 'ObjectId' || Buffer.isBuffer(doc.id)) {
      return typeof doc.toString === 'function' ? doc.toString() : String(value)
    }
    if (typeof doc.id === 'string' && doc.id) return doc.id
    if (doc._id != null) return mapId(doc._id)
  }
  return String(value)
}

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : String(value)
}

export function mapUser(value: unknown): UserRef | null {
  if (!value || typeof value !== 'object') return null
  const doc = value as { id?: string; _id?: unknown; name?: string; email?: string }
  const id = doc.id ?? (doc._id ? String(doc._id) : '')
  if (!id || !doc.name || !doc.email) return null
  return { id, name: doc.name, email: doc.email }
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

function isWatching(watchers: unknown[] | undefined, viewerId?: string): boolean {
  if (!viewerId || !watchers?.length) return false
  return watchers.some((entry) => mapId(entry) === viewerId)
}

interface TaskSource {
  id: string
  title: string
  description?: string
  status: TaskDto['status']
  priority: TaskDto['priority']
  assignedTo?: unknown
  createdBy: unknown
  specId?: unknown
  tags?: string[]
  dueDate?: Date | string | null
  watchers?: unknown[]
  blockedReason?: string
  blockedBy?: unknown[]
  checklist?: ChecklistItemDto[]
  externalUrl?: string
  createdAt: Date | string
  updatedAt: Date | string
}

function mapBlockedBy(entries: unknown[] | undefined): TaskRef[] {
  if (!entries?.length) return []
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        const id = mapId(entry)
        return id ? { id, title: 'Task' } : null
      }
      const doc = entry as { id?: string; _id?: unknown; title?: string }
      const id = doc.id ?? (doc._id ? String(doc._id) : '')
      if (!id) return null
      return { id, title: doc.title ?? 'Task' }
    })
    .filter((item): item is TaskRef => Boolean(item))
}

export function mapTaskSource(value: unknown, viewerId?: string): TaskDto {
  const task = value as TaskSource
  const blockedReason = (task.blockedReason ?? '').trim()
  const blockedBy = mapBlockedBy(task.blockedBy)
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
    watching: isWatching(task.watchers, viewerId),
    blocked: Boolean(blockedReason) || blockedBy.length > 0,
    blockedReason,
    blockedBy,
    checklist: normalizeChecklist(task.checklist ?? DEFAULT_CHECKLIST),
    externalUrl: (task.externalUrl ?? '').trim(),
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
  status: SpecStatus
  archivedAt?: Date | string | null
  approvedAt?: Date | string | null
  approvedBy?: unknown
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
    archivedAt: iso(spec.archivedAt),
    approvedAt: iso(spec.approvedAt),
    approvedBy: mapUser(spec.approvedBy),
    createdBy: requireUser(spec.createdBy, 'Spec author'),
    tasks,
    taskCount: spec.tasks?.length ?? tasks.length,
    createdAt: iso(spec.createdAt) ?? '',
    updatedAt: iso(spec.updatedAt) ?? '',
  }
}

export function mapSpecRevision(value: unknown): SpecRevisionDto {
  const doc = value as {
    id?: string
    _id?: unknown
    specId: unknown
    version: number
    title: string
    status: SpecStatus
    createdBy: unknown
    createdAt?: Date | string
  }
  return {
    id: doc.id ?? String(doc._id),
    specId: mapId(doc.specId) ?? '',
    version: doc.version,
    title: doc.title,
    status: doc.status,
    createdBy: requireUser(doc.createdBy, 'Revision author'),
    createdAt: iso(doc.createdAt) ?? '',
  }
}
