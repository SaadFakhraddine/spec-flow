import { describe, expect, it } from 'vitest'
import { normalizeAppearance, resolveTheme } from '@/utils/appearance'

describe('appearance utils', () => {
  it('fills defaults for invalid values', () => {
    expect(normalizeAppearance({ theme: 'neon' as never })).toEqual({
      theme: 'system',
      accent: 'amber',
      density: 'comfortable',
    })
  })

  it('keeps theme/density and locks accent to amber', () => {
    expect(
      normalizeAppearance({ theme: 'light', accent: 'teal' as never, density: 'compact' }),
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
