import axios from 'axios'

interface ErrorBody {
  message?: string
  errors?: string[]
}

export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Something went wrong'
  const data = error.response?.data as ErrorBody | undefined
  if (data?.errors && data.errors.length > 0) return data.errors.join(' ')
  if (data?.message) return data.message
  if (error.code === 'ECONNABORTED') return 'The request timed out'
  if (!error.response) return 'Cannot reach the server'
  return 'Something went wrong'
}
