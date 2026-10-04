<script setup lang="ts">
import { usePreferences } from '@/composables/usePreferences'
import { useToast } from '@/composables/useToast'
import type { TasksViewPref } from '@/types'

const { prefs, save } = usePreferences()
const toast = useToast()

const options: { value: TasksViewPref; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
]

async function setView(value: TasksViewPref): Promise<void> {
  if (value === prefs.value.defaults.tasksView) return
  const ok = await save({ defaults: { tasksView: value } })
  if (!ok) toast.error('Could not sync defaults')
}
</script>

<template>
  <section>
    <p class="text-body text-muted">
      Prefer list or board when opening Tasks (unless the URL sets a view).
    </p>
    <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Default tasks view">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="rounded-md border px-3 py-1.5 text-body motion-color"
        :class="
          prefs.defaults.tasksView === option.value
            ? 'border-primary bg-elevated text-text'
            : 'border-line text-muted hover:bg-elevated'
        "
        @click="setView(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>
</template>
