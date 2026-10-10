import { AppError } from './AppError'

/** Allow empty / null, or http(s) URLs only. Rejects javascript:, data:, etc. */
export function sanitizeExternalUrl(value: string | null | undefined): string {
  if (value == null) return ''
  const trimmed = String(value).trim()
  if (!trimmed) return ''
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new AppError('External link must be a valid http(s) URL', 400)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new AppError('External link must use http or https', 400)
  }
  return trimmed
}
