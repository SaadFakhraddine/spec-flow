import type { ChecklistItemDto, TaskInput, TaskPriority, TaskStatus } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { normalizeChecklist } from '../utils/checklist'
import { isTaskPriority, isTaskStatus } from '../utils/mappers'

function applyWorkflowFields(input: TaskInput, patch: Record<string, unknown>): void {
  if (input.blockedReason !== undefined) {
    patch.blockedReason = input.blockedReason ? String(input.blockedReason).trim() : ''
  }
  if (input.blockedBy !== undefined) {
    patch.blockedBy = input.blockedBy.slice(0, 10)
  }
  if (input.checklist !== undefined) {
    patch.checklist = normalizeChecklist(input.checklist as ChecklistItemDto[])
  }
  if (input.externalUrl !== undefined) {
    patch.externalUrl = input.externalUrl ? String(input.externalUrl).trim() : ''
  }
}

export function developerPatch(input: TaskInput): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (input.status !== undefined) {
    if (!isTaskStatus(input.status)) throw new AppError('Invalid status', 400)
    patch.status = input.status
  }
  applyWorkflowFields(input, patch)
  if (Object.keys(patch).length === 0) {
    throw new AppError('Developers can only update status, blockers, checklist, or link', 403)
  }
  return patch
}

export function adminPatch(input: TaskInput): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.status && isTaskStatus(input.status)) patch.status = input.status
  if (input.priority && isTaskPriority(input.priority)) patch.priority = input.priority
  if (input.assignedTo !== undefined) patch.assignedTo = input.assignedTo
  if (input.tags !== undefined) patch.tags = input.tags
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate ? new Date(input.dueDate) : null
  applyWorkflowFields(input, patch)
  return patch
}

export function priorityOf(value: string | undefined): TaskPriority | undefined {
  return value && isTaskPriority(value) ? value : undefined
}

export type { TaskStatus }
