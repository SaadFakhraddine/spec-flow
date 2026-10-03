import { onBeforeUnmount, onMounted, type Ref, watch } from 'vue'
import { focusableElements, trapTabKey } from '@/utils/focusable'

export function useFocusTrap(
  root: Ref<HTMLElement | null>,
  options: { active?: Ref<boolean>; onEscape: () => void },
): void {
  let previous: HTMLElement | null = null

  function activate(): void {
    previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const el = root.value
    if (!el) return
    const first = focusableElements(el)[0]
    first?.focus()
  }

  function onKeydown(event: KeyboardEvent): void {
    if (options.active && !options.active.value) return
    if (event.key === 'Escape') {
      event.preventDefault()
      options.onEscape()
      return
    }
    if (root.value) trapTabKey(event, root.value)
  }

  onMounted(() => {
    document.addEventListener('keydown', onKeydown)
    if (!options.active || options.active.value) activate()
  })

  if (options.active) {
    watch(options.active, (value) => {
      if (value) activate()
      else previous?.focus()
    })
  }

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    previous?.focus()
  })
}
