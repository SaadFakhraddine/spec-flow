<script setup lang="ts">
import { usePreferences } from '@/composables/usePreferences'
import { useToast } from '@/composables/useToast'
import type { NotificationPreferences } from '@/types'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'

const { prefs, save } = usePreferences()
const toast = useToast()

const options: { key: keyof NotificationPreferences; label: string; hint: string }[] = [
  { key: 'taskAssigned', label: 'Task assigned', hint: 'When someone assigns a task to you' },
  { key: 'commentCreated', label: 'Comments', hint: 'New comments on tasks or specs you follow' },
  { key: 'mentionCreated', label: 'Mentions', hint: 'When someone @mentions you' },
  { key: 'taskStatus', label: 'Status changes', hint: 'When watched tasks change status' },
]

async function onToggle(key: keyof NotificationPreferences, value: boolean): Promise<void> {
  const ok = await save({ notifications: { [key]: value } })
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
      <ToggleSwitch
        :model-value="prefs.notifications[option.key]"
        :label="option.label"
        @update:model-value="onToggle(option.key, $event)"
      />
    </li>
  </ul>
</template>
