import type { Task, TaskStatus } from '@/types'
import { taskStatuses } from '@/utils/status'

export type BoardColumns = Record<TaskStatus, Task[]>

export function emptyBoard(): BoardColumns {
  return Object.fromEntries(taskStatuses.map((status) => [status, [] as Task[]])) as BoardColumns
}

export function cloneBoard(columns: BoardColumns): BoardColumns {
  return Object.fromEntries(
    taskStatuses.map((status) => [status, [...(columns[status] ?? [])]]),
  ) as BoardColumns
}

export function findTaskColumn(columns: BoardColumns, taskId: string): TaskStatus | null {
  for (const status of taskStatuses) {
    if (columns[status]?.some((task) => task.id === taskId)) return status
  }
  return null
}

export function moveTaskOnBoard(
  columns: BoardColumns,
  taskId: string,
  nextStatus: TaskStatus,
): { next: BoardColumns; previous: BoardColumns; moved: Task | null } {
  const previous = cloneBoard(columns)
  const from = findTaskColumn(columns, taskId)
  if (!from || from === nextStatus) {
    return { next: columns, previous, moved: null }
  }
  const task = columns[from]?.find((item) => item.id === taskId) ?? null
  if (!task) return { next: columns, previous, moved: null }
  const next = cloneBoard(columns)
  next[from] = next[from].filter((item) => item.id !== taskId)
  next[nextStatus] = [{ ...task, status: nextStatus }, ...next[nextStatus]]
  return { next, previous, moved: { ...task, status: nextStatus } }
}
