import { ref, watch } from 'vue'
import apiClient from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse, AppearancePreferences, User } from '@/types'
import {
  applyAppearance,
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  persistAppearance,
  readStoredAppearance,
} from '@/utils/appearance'

const prefs = ref<AppearancePreferences>(readStoredAppearance())
let mediaBound = false

function onSystemChange(): void {
  if (prefs.value.theme === 'system') applyAppearance(prefs.value)
}

function bindSystemListener(): void {
  if (mediaBound || typeof window === 'undefined') return
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onSystemChange)
  mediaBound = true
}

function setLocal(next: AppearancePreferences): void {
  prefs.value = normalizeAppearance(next)
  persistAppearance(prefs.value)
  applyAppearance(prefs.value)
}

export function bootAppearance(): void {
  setLocal(readStoredAppearance())
  bindSystemListener()
}

export function useAppearance() {
  const auth = useAuthStore()

  async function save(partial: Partial<AppearancePreferences>): Promise<boolean> {
    const next = normalizeAppearance({ ...prefs.value, ...partial })
    setLocal(next)
    if (!auth.isAuthenticated) return true
    try {
      const response = await apiClient.patch<ApiResponse<User>>('/auth/me/preferences', next)
      auth.setUser(response.data.data)
      setLocal(response.data.data.preferences)
      return true
    } catch {
      return false
    }
  }

  function hydrateFromUser(): void {
    if (auth.user?.preferences) setLocal(auth.user.preferences)
  }

  watch(
    () => auth.user?.id,
    () => {
      hydrateFromUser()
    },
  )

  return {
    prefs,
    save,
    hydrateFromUser,
    defaults: DEFAULT_APPEARANCE,
  }
}
