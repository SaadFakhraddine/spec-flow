import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/utils/errors'

export function useAuth() {
  const store = useAuthStore()
  const loading = ref(false)
  const error = ref('')
  const refs = storeToRefs(store)

  async function guard<T>(action: () => Promise<T>): Promise<T | null> {
    loading.value = true
    error.value = ''
    try {
      return await action()
    } catch (caught) {
      error.value = errorMessage(caught)
      return null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    const result = await guard(() => store.login(email, password))
    return result !== null
  }

  async function register(name: string, email: string, password: string): Promise<boolean> {
    const result = await guard(() => store.register(name, email, password))
    return result !== null
  }

  return { ...refs, loading, error, login, register, logout: () => store.logout() }
}
