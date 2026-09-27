import type { SpecStatus, TaskPriority, TaskStatus } from '@/types'

export const taskStatuses: TaskStatus[] = ['backlog', 'in-progress', 'in-review', 'done']
export const taskPriorities: TaskPriority[] = ['low', 'medium', 'high', 'critical']
export const specStatuses: SpecStatus[] = ['draft', 'ready', 'in-review', 'approved']

export const taskBorder: Record<TaskStatus, string> = {
  backlog: 'border-l-muted',
  'in-progress': 'border-l-warning',
  'in-review': 'border-l-primary',
  done: 'border-l-success',
}

export const specBorder: Record<SpecStatus, string> = {
  draft: 'border-l-muted',
  ready: 'border-l-primary',
  'in-review': 'border-l-warning',
  approved: 'border-l-success',
}

export const taskStatusLabel: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In progress',
  'in-review': 'In review',
  done: 'Done',
}

export const specStatusLabel: Record<SpecStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  'in-review': 'In review',
  approved: 'Approved',
}

export const priorityClass: Record<TaskPriority, string> = {
  low: 'text-muted',
  medium: 'text-text',
  high: 'text-warning',
  critical: 'text-danger',
}
