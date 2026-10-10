import type { AppearancePreferences, DensityPref, ThemePref } from '@/types'

export const APPEARANCE_KEY = 'sf-appearance'

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  theme: 'system',
  accent: 'amber',
  density: 'comfortable',
}

export function resolveTheme(theme: ThemePref): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function readStoredAppearance(): AppearancePreferences {
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY)
    if (!raw) return { ...DEFAULT_APPEARANCE }
    const parsed = JSON.parse(raw) as Partial<AppearancePreferences>
    return normalizeAppearance(parsed)
  } catch {
    return { ...DEFAULT_APPEARANCE }
  }
}

export function normalizeAppearance(value: Partial<AppearancePreferences>): AppearancePreferences {
  const themes: ThemePref[] = ['light', 'dark', 'system']
  const densities: DensityPref[] = ['comfortable', 'compact']
  return {
    theme: value.theme && themes.includes(value.theme) ? value.theme : DEFAULT_APPEARANCE.theme,
    // Product locks to a single amber accent; ignore legacy teal/slate prefs.
    accent: 'amber',
    density:
      value.density && densities.includes(value.density) ? value.density : DEFAULT_APPEARANCE.density,
  }
}

export function persistAppearance(prefs: AppearancePreferences): void {
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(prefs))
}

export function applyAppearance(prefs: AppearancePreferences): void {
  const root = document.documentElement
  root.dataset.theme = resolveTheme(prefs.theme)
  root.dataset.accent = 'amber'
  root.dataset.density = prefs.density
}
