import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken } from '@/utils/token'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000
const RETRYABLE_CODES = [408, 429, 500, 502, 503, 504]

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
  _refreshed?: boolean
}

type RefreshHandler = () => Promise<string>

let refreshHandler: RefreshHandler | null = null
let logoutHandler: (() => void) | null = null

export function registerAuthHandlers(handlers: { refresh: RefreshHandler; logout: () => void }): void {
  refreshHandler = handlers.refresh
  logoutHandler = handlers.logout
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isCredentialRoute(url: string | undefined): boolean {
  if (!url) return false
  return ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => url.includes(path))
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

async function retryLater(config: RetryConfig): Promise<unknown> {
  config._retryCount = (config._retryCount ?? 0) + 1
  const delay = RETRY_DELAY_MS * 2 ** (config._retryCount - 1)
  await sleep(delay)
  return apiClient(config)
}

async function refreshOnce(config: RetryConfig, error: AxiosError): Promise<unknown> {
  if (!refreshHandler) return Promise.reject(error)
  try {
    const token = await refreshHandler()
    setAccessToken(token)
    config.headers.Authorization = `Bearer ${token}`
    return await apiClient(config)
  } catch (refreshError) {
    logoutHandler?.()
    const module = await import('@/router')
    await module.router.push('/login')
    return Promise.reject(refreshError)
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    if (!config) return Promise.reject(error)
    config._retryCount = config._retryCount ?? 0
    const status = error.response?.status
    if (status === 401 && !config._refreshed && !isCredentialRoute(config.url)) {
      config._refreshed = true
      return refreshOnce(config, error)
    }
    const method = (config.method ?? 'get').toLowerCase()
    const idempotent = method === 'get' || method === 'head'
    const canRetry =
      idempotent &&
      config._retryCount < MAX_RETRIES &&
      (!status || RETRYABLE_CODES.includes(status))
    if (canRetry) return retryLater(config)
    return Promise.reject(error)
  },
)

let refreshInFlight: Promise<string> | null = null

export async function requestRefresh(): Promise<string> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = axios
    .post<{ data: { accessToken: string } }>(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {},
      { withCredentials: true, timeout: 10000 },
    )
    .then((response) => response.data.data.accessToken)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

export default apiClient
