<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { formatRelative } from '@/utils/format'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})
const { items, unreadCount, markRead, markAllRead, fetchNotifications } = useNotifications(true)

function placePanel(): void {
  const anchor = root.value?.getBoundingClientRect()
  if (!anchor) return
  const width = 320
  const left = Math.min(anchor.left, window.innerWidth - width - 12)
  const spaceAbove = anchor.top
  const openUp = spaceAbove > 280
  panelStyle.value = openUp
    ? {
        left: `${Math.max(12, left)}px`,
        bottom: `${window.innerHeight - anchor.top + 8}px`,
        width: `${width}px`,
      }
    : {
        left: `${Math.max(12, left)}px`,
        top: `${anchor.bottom + 8}px`,
        width: `${width}px`,
      }
}

function close(): void {
  open.value = false
}

async function toggle(): Promise<void> {
  open.value = !open.value
  if (open.value) {
    await fetchNotifications()
    await nextTick()
    placePanel()
  }
}

async function openItem(id: string, taskId: string | null, specId: string | null): Promise<void> {
  await markRead(id)
  close()
  if (taskId) await router.push(`/tasks/${taskId}`)
  else if (specId) await router.push(`/specs/${specId}`)
}

function onDocumentClick(event: MouseEvent): void {
  if (!open.value) return
  const target = event.target as Node
  if (root.value?.contains(target) || panel.value?.contains(target)) return
  close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) close()
}

function onResize(): void {
  if (open.value) placePanel()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div ref="root" class="relative px-2">
    <button
      type="button"
      class="relative rounded-md px-2 py-1 text-body text-muted motion-color hover:bg-elevated hover:text-text"
      aria-label="Notifications"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      Alerts
      <span
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] text-background"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="panel"
        class="fixed z-[80] rounded-md border border-line bg-surface p-3 shadow-panel"
        :style="panelStyle"
        role="dialog"
        aria-label="Notifications"
        @click.stop
      >
        <div class="mb-2 flex items-center justify-between gap-2 border-b border-line pb-2">
          <p class="text-body font-medium">Notifications</p>
          <button
            type="button"
            class="rounded-md border border-line px-2 py-1 text-label text-muted motion-color hover:bg-elevated hover:text-text"
            aria-label="Close notifications"
            @click="close"
          >
            Close
          </button>
        </div>
        <div class="mb-2 flex justify-end">
          <Button variant="ghost" @click="markAllRead">Mark all read</Button>
        </div>
        <ul class="max-h-72 space-y-2 overflow-auto">
          <li v-if="items.length === 0" class="text-body text-muted">No notifications yet.</li>
          <li v-for="item in items" :key="item.id">
            <button
              type="button"
              class="w-full rounded-md px-2 py-2 text-left motion-color hover:bg-elevated"
              :class="item.readAt ? 'text-muted' : 'text-text'"
              @click="openItem(item.id, item.taskId, item.specId)"
            >
              <p class="text-body">{{ item.message }}</p>
              <p class="mt-0.5 font-mono text-label text-muted">{{ formatRelative(item.createdAt) }}</p>
            </button>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
