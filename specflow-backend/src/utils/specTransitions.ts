import type { SpecStatus } from '../types/api.types'
import { SPEC_STATUSES } from '../types/api.types'

export function nextSpecStatus(current: SpecStatus): SpecStatus | null {
  const index = SPEC_STATUSES.indexOf(current)
  if (index < 0 || index >= SPEC_STATUSES.length - 1) return null
  return SPEC_STATUSES[index + 1]
}

export function assertSpecTransition(from: SpecStatus, to: SpecStatus): void {
  if (from === to) return
  const allowed = nextSpecStatus(from)
  if (to !== allowed) {
    throw new Error(
      allowed
        ? `Status can only move from ${from} to ${allowed}`
        : `Status ${from} cannot advance further`,
    )
  }
}

export function allowedSpecStatuses(current: SpecStatus): SpecStatus[] {
  const next = nextSpecStatus(current)
  return next ? [current, next] : [current]
}
