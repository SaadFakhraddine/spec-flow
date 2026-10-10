import { describe, expect, it } from 'vitest'
import { normalizeAppearance, resolveTheme } from '@/utils/appearance'

describe('appearance utils', () => {
  it('fills defaults for invalid values', () => {
    expect(normalizeAppearance({ theme: 'neon' as never })).toEqual({
      theme: 'system',
      density: 'comfortable',
    })
  })

  it('keeps valid theme and density', () => {
    expect(normalizeAppearance({ theme: 'light', density: 'compact' })).toEqual({
      theme: 'light',
      density: 'compact',
    })
  })

  it('resolves explicit themes', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })
})
