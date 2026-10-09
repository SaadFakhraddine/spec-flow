import type { SpecStatus } from '@/types'
import { specStatuses } from '@/utils/status'

export function nextSpecStatus(current: SpecStatus): SpecStatus | null {
  const index = specStatuses.indexOf(current)
  if (index < 0 || index >= specStatuses.length - 1) return null
  return specStatuses[index + 1]
}

export function allowedSpecStatuses(current: SpecStatus): SpecStatus[] {
  const next = nextSpecStatus(current)
  return next ? [current, next] : [current]
}
