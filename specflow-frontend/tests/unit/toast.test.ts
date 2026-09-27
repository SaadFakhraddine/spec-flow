import { afterEach, describe, expect, it, vi } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast', () => {
  afterEach(() => {
    vi.useRealTimers()
    const { toasts, dismiss } = useToast()
    toasts.value.forEach((toast) => dismiss(toast.id))
  })

  it('adds a toast and removes it after 4 seconds', () => {
    vi.useFakeTimers()
    const { toasts, success } = useToast()
    success('Task created')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]?.message).toBe('Task created')
    vi.advanceTimersByTime(4000)
    expect(toasts.value).toHaveLength(0)
  })
})
