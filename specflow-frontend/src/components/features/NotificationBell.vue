<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { formatRelative } from '@/utils/format'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const { items, unreadCount, markRead, markAllRead } = useNotifications(true)

function close(): void {
  open.value = false
}

function toggle(): void {
  open.value = !open.value
}

async function openItem(id: string, taskId: string | null, specId: string | null): Promise<void> {
  await markRead(id)
  close()
  if (taskId) await router.push(`/tasks/${taskId}`)
  else if (specId) await router.push(`/specs/${specId}`)
}

function onDocumentClick(event: MouseEvent): void {
  if (!open.value || !root.value) return
  if (!root.value.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
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
    <div
      v-if="open"
      class="absolute bottom-10 left-0 z-50 w-72 rounded-md border border-line bg-surface p-3 shadow-panel md:bottom-auto md:top-10"
      role="menu"
      @click.stop
    >
      <div class="mb-2 flex items-center justify-between gap-2">
        <p class="text-body font-medium">Notifications</p>
        <div class="flex items-center gap-1">
          <Button variant="ghost" @click="markAllRead">Mark all read</Button>
          <Button variant="ghost" aria-label="Close notifications" @click="close">Close</Button>
        </div>
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
  </div>
</template>
