import type {
  AccentPref,
  DefaultPreferences,
  DensityPref,
  LandingPagePref,
  NotificationPreferences,
  TasksScopePref,
  TasksViewPref,
  ThemePref,
  UserPreferences,
} from '../types/api.types'
import {
  ACCENT_PREFS,
  DEFAULT_PREFERENCES,
  DENSITY_PREFS,
  LANDING_PAGE_PREFS,
  TASKS_SCOPE_PREFS,
  TASKS_VIEW_PREFS,
  THEME_PREFS,
} from '../types/api.types'

export type PreferencesPatch = Partial<
  Pick<UserPreferences, 'theme' | 'accent' | 'density'>
> & {
  notifications?: Partial<NotificationPreferences>
  defaults?: Partial<DefaultPreferences>
}

function toPlain(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  if (typeof (value as { toObject?: () => unknown }).toObject === 'function') {
    return (value as { toObject: () => Record<string, unknown> }).toObject()
  }
  return value as Record<string, unknown>
}

function readBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readNotifications(value: unknown): NotificationPreferences {
  const src = toPlain(value)
  return {
    taskAssigned: readBool(src?.taskAssigned, DEFAULT_PREFERENCES.notifications.taskAssigned),
    commentCreated: readBool(src?.commentCreated, DEFAULT_PREFERENCES.notifications.commentCreated),
    mentionCreated: readBool(src?.mentionCreated, DEFAULT_PREFERENCES.notifications.mentionCreated),
    taskStatus: readBool(src?.taskStatus, DEFAULT_PREFERENCES.notifications.taskStatus),
  }
}

function readDefaults(value: unknown): DefaultPreferences {
  const src = toPlain(value)
  return {
    tasksView: readEnum<TasksViewPref>(
      src?.tasksView,
      TASKS_VIEW_PREFS,
      DEFAULT_PREFERENCES.defaults.tasksView,
    ),
    landingPage: readEnum<LandingPagePref>(
      src?.landingPage,
      LANDING_PAGE_PREFS,
      DEFAULT_PREFERENCES.defaults.landingPage,
    ),
    tasksScope: readEnum<TasksScopePref>(
      src?.tasksScope,
      TASKS_SCOPE_PREFS,
      DEFAULT_PREFERENCES.defaults.tasksScope,
    ),
  }
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

export function normalizePreferences(value?: unknown): UserPreferences {
  const src = toPlain(value)
  return {
    theme: readEnum<ThemePref>(src?.theme, THEME_PREFS, DEFAULT_PREFERENCES.theme),
    accent: readEnum<AccentPref>(src?.accent, ACCENT_PREFS, DEFAULT_PREFERENCES.accent),
    density: readEnum<DensityPref>(src?.density, DENSITY_PREFS, DEFAULT_PREFERENCES.density),
    notifications: readNotifications(src?.notifications),
    defaults: readDefaults(src?.defaults),
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
