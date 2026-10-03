import { describe, expect, it, vi } from 'vitest'
import { focusableElements, trapTabKey } from '@/utils/focusable'

describe('focusable', () => {
  it('lists interactive elements and wraps Tab focus', () => {
    const root = document.createElement('div')
    const first = document.createElement('button')
    const last = document.createElement('button')
    first.textContent = 'One'
    last.textContent = 'Two'
    root.append(first, last)
    document.body.append(root)
    expect(focusableElements(root)).toHaveLength(2)

    last.focus()
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const prevent = vi.spyOn(event, 'preventDefault')
    Object.defineProperty(event, 'shiftKey', { value: false })
    trapTabKey(event, root)
    expect(prevent).toHaveBeenCalled()
    expect(document.activeElement).toBe(first)
    root.remove()
  })
})
