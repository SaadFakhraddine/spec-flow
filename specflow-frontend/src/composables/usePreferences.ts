import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import apiClient from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import type {
  ApiResponse,
  DefaultPreferences,
  NotificationPreferences,
  User,
  UserPreferences,
} from '@/types'
import { DEFAULT_USER_PREFERENCES } from '@/types'

export type PreferencesPatch = Partial<Pick<UserPreferences, 'theme' | 'accent' | 'density'>> & {
  notifications?: Partial<NotificationPreferences>
  defaults?: Partial<DefaultPreferences>
}

export function normalizeUserPreferences(
  value?: Partial<UserPreferences> | null,
): UserPreferences {
  return {
    theme: value?.theme ?? DEFAULT_USER_PREFERENCES.theme,
    accent: value?.accent ?? DEFAULT_USER_PREFERENCES.accent,
    density: value?.density ?? DEFAULT_USER_PREFERENCES.density,
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...(value?.notifications ?? {}),
    },
    defaults: {
      ...DEFAULT_USER_PREFERENCES.defaults,
      ...(value?.defaults ?? {}),
    },
  }
}

export function usePreferences() {
  const auth = useAuthStore()
  const { user } = storeToRefs(auth)

  const prefs = computed(() => normalizeUserPreferences(user.value?.preferences))

  async function save(patch: PreferencesPatch): Promise<boolean> {
    if (!auth.isAuthenticated || !user.value) return false
    const previous = user.value
    user.value = {
      ...previous,
      preferences: normalizeUserPreferences(mergeLocal(previous.preferences, patch)),
    }
    try {
      const response = await apiClient.patch<ApiResponse<User>>('/auth/me/preferences', patch)
      auth.setUser(response.data.data)
      return true
    } catch {
      user.value = previous
      return false
    }
  }

  return { prefs, save }
}

function mergeLocal(
  current: UserPreferences | undefined,
  patch: PreferencesPatch,
): UserPreferences {
  const base = normalizeUserPreferences(current)
  return normalizeUserPreferences({
    theme: patch.theme ?? base.theme,
    accent: patch.accent ?? base.accent,
    density: patch.density ?? base.density,
    notifications: { ...base.notifications, ...(patch.notifications ?? {}) },
    defaults: { ...base.defaults, ...(patch.defaults ?? {}) },
  })
}
