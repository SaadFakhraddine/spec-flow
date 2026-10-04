import { describe, expect, it } from 'vitest'
import { normalizeAppearance, resolveTheme } from '@/utils/appearance'

describe('appearance utils', () => {
  it('fills defaults for invalid values', () => {
    expect(normalizeAppearance({ theme: 'neon' as never })).toEqual({
      theme: 'system',
      accent: 'teal',
      density: 'comfortable',
    })
  })

  it('keeps valid preferences', () => {
    expect(
      normalizeAppearance({ theme: 'light', accent: 'amber', density: 'compact' }),
    ).toEqual({
      theme: 'light',
      accent: 'amber',
      density: 'compact',
    })
  })

  it('resolves explicit themes', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })
})
