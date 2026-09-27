export function readPage(value: unknown): number {
  const page = typeof value === 'string' ? Number(value) : 1
  if (!Number.isInteger(page) || page < 1) return 1
  return page
}

export function readLimit(value: unknown): number {
  const limit = typeof value === 'string' ? Number(value) : 20
  if (!Number.isInteger(limit) || limit < 1) return 20
  return Math.min(limit, 50)
}

export function readText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function startOfWeek(date: Date): Date {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? 6 : day - 1
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - diff)
  return copy
}
