import type { TaskInput, TaskPriority, TaskStatus } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { isTaskPriority, isTaskStatus } from '../utils/mappers'

export function developerPatch(input: TaskInput): { status: TaskStatus } {
  if (!input.status || !isTaskStatus(input.status)) {
    throw new AppError('Developers can only update task status', 403)
  }
  return { status: input.status }
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
  return patch
}

export function priorityOf(value: string | undefined): TaskPriority | undefined {
  return value && isTaskPriority(value) ? value : undefined
}
