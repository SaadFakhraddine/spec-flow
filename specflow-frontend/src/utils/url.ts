/** True only for absolute http(s) URLs safe to use in href. */
export function isSafeHttpUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  return isSafeHttpUrl(value) ? value!.trim() : null
}
