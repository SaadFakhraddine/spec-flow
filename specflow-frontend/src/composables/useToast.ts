import { ref } from 'vue'

export interface ToastItem {
  id: string
  tone: 'success' | 'error'
  message: string
}

const toasts = ref<ToastItem[]>([])

function dismiss(id: string): void {
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

function push(tone: ToastItem['tone'], message: string): void {
  const id = crypto.randomUUID()
  toasts.value = [...toasts.value, { id, tone, message }]
  setTimeout(() => dismiss(id), 4000)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
  }
}
