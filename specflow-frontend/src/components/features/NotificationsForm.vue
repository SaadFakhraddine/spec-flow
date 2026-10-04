<script setup lang="ts">
import { computed } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { useToast } from '@/composables/useToast'
import type { NotificationPreferences } from '@/types'

const { current, save } = usePreferences()
const toast = useToast()

const prefs = computed(() => current().notifications)

const options: { key: keyof NotificationPreferences; label: string; hint: string }[] = [
  { key: 'taskAssigned', label: 'Task assigned', hint: 'When someone assigns a task to you' },
  { key: 'commentCreated', label: 'Comments', hint: 'New comments on tasks or specs you follow' },
  { key: 'mentionCreated', label: 'Mentions', hint: 'When someone @mentions you' },
  { key: 'taskStatus', label: 'Status changes', hint: 'When watched tasks change status' },
]

async function toggle(key: keyof NotificationPreferences): Promise<void> {
  const next = !prefs.value[key]
  const ok = await save({ notifications: { [key]: next } })
  if (!ok) toast.error('Could not sync notification preferences')
}
</script>

<template>
  <ul class="space-y-3">
    <li
      v-for="option in options"
      :key="option.key"
      class="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0"
    >
      <div>
        <p class="text-body font-medium">{{ option.label }}</p>
        <p class="mt-0.5 text-label text-muted">{{ option.hint }}</p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="prefs[option.key]"
        class="sf-chip shrink-0 motion-color"
        :class="prefs[option.key] ? 'bg-primary/15 text-primary' : 'bg-elevated text-muted'"
        @click="toggle(option.key)"
      >
        {{ prefs[option.key] ? 'On' : 'Off' }}
      </button>
    </li>
  </ul>
</template>
