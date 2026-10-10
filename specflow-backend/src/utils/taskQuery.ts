/** Shared Mongo filter: task is blocked by reason or dependency list. */
export const BLOCKED_TASK_OR = [
  { blockedReason: { $exists: true, $nin: [null, ''] } },
  { 'blockedBy.0': { $exists: true } },
] as const

export const TASK_USER_FIELDS = 'name email'

export function applyBlockedFilter(query: Record<string, unknown>, blocked?: boolean): void {
  if (blocked !== true) return
  const existingAnd = Array.isArray(query.$and) ? (query.$and as unknown[]) : []
  if (query.$or) {
    existingAnd.push({ $or: query.$or })
    delete query.$or
  }
  existingAnd.push({ $or: [...BLOCKED_TASK_OR] })
  query.$and = existingAnd
  query.status = query.status ?? { $ne: 'done' }
}

export function applyDueFilter(query: Record<string, unknown>, due?: 'overdue' | 'soon'): void {
  if (!due) return
  const now = new Date()
  if (due === 'overdue') {
    query.dueDate = { $ne: null, $lt: now }
    query.status = query.status ?? { $ne: 'done' }
    return
  }
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  query.dueDate = { $ne: null, $gte: now, $lte: week }
  query.status = query.status ?? { $ne: 'done' }
}
