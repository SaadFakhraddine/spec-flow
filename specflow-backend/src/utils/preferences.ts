import type {
  DefaultPreferences,
  NotificationPreferences,
  UserPreferences,
} from '../types/api.types'
import { DEFAULT_PREFERENCES } from '../types/api.types'

export type PreferencesPatch = Partial<
  Pick<UserPreferences, 'theme' | 'accent' | 'density'>
> & {
  notifications?: Partial<NotificationPreferences>
  defaults?: Partial<DefaultPreferences>
}

export function normalizePreferences(value?: Partial<UserPreferences> | null): UserPreferences {
  return {
    theme: value?.theme ?? DEFAULT_PREFERENCES.theme,
    accent: value?.accent ?? DEFAULT_PREFERENCES.accent,
    density: value?.density ?? DEFAULT_PREFERENCES.density,
    notifications: {
      ...DEFAULT_PREFERENCES.notifications,
      ...(value?.notifications ?? {}),
    },
    defaults: {
      ...DEFAULT_PREFERENCES.defaults,
      ...(value?.defaults ?? {}),
    },
  }
}

export function mergePreferences(
  current: UserPreferences,
  patch: PreferencesPatch,
): UserPreferences {
  return normalizePreferences({
    theme: patch.theme ?? current.theme,
    accent: patch.accent ?? current.accent,
    density: patch.density ?? current.density,
    notifications: { ...current.notifications, ...(patch.notifications ?? {}) },
    defaults: { ...current.defaults, ...(patch.defaults ?? {}) },
  })
}
