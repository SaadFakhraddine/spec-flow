import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import apiClient, { registerAuthHandlers, requestRefresh } from '@/composables/useApi'
import type { ApiResponse, User } from '@/types'
import { setAccessToken } from '@/utils/token'

interface Session {
  accessToken: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref('')
  const initialized = ref(false)
  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
  let pending: Promise<void> | null = null

  function clearSession(): void {
    user.value = null
    accessToken.value = ''
    setAccessToken('')
  }

  function setUser(next: User): void {
    user.value = next
  }

  function applySession(session: Session): void {
    accessToken.value = session.accessToken
    user.value = session.user
    setAccessToken(session.accessToken)
  }

  async function refreshAccessToken(): Promise<string> {
    const token = await requestRefresh()
    accessToken.value = token
    setAccessToken(token)
    return token
  }

  async function loadUser(): Promise<void> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    user.value = response.data.data
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<Session>>('/auth/login', { email, password })
    applySession(response.data.data)
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<Session>>('/auth/register', { name, email, password })
    applySession(response.data.data)
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      clearSession()
      return
    }
    clearSession()
  }

  async function runBootstrap(): Promise<void> {
    try {
      await refreshAccessToken()
      await loadUser()
    } catch {
      clearSession()
    } finally {
      initialized.value = true
    }
  }

  async function bootstrap(): Promise<void> {
    if (initialized.value) return
    if (!pending) pending = runBootstrap()
    await pending
  }

  registerAuthHandlers({ refresh: () => refreshAccessToken(), logout: clearSession })

  return {
    user,
    accessToken,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
    loadUser,
    bootstrap,
    clearSession,
    setUser,
  }
})
