<script setup lang="ts">
import { usePreferences } from '@/composables/usePreferences'
import { useToast } from '@/composables/useToast'
import type { LandingPagePref, TasksScopePref, TasksViewPref } from '@/types'

const { prefs, save } = usePreferences()
const toast = useToast()

const viewOptions: { value: TasksViewPref; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
]

const landingOptions: { value: LandingPagePref; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'my-work', label: 'My work' },
  { value: 'tasks', label: 'Tasks' },
]

const scopeOptions: { value: TasksScopePref; label: string }[] = [
  { value: 'all', label: 'All tasks' },
  { value: 'mine', label: 'Assigned to me' },
]

async function setDefault(
  patch: Partial<{ tasksView: TasksViewPref; landingPage: LandingPagePref; tasksScope: TasksScopePref }>,
): Promise<void> {
  const ok = await save({ defaults: patch })
  if (!ok) toast.error('Could not sync defaults')
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-body font-medium text-text">Tasks view</p>
      <p class="mt-1 text-body text-muted">
        Prefer list or board when opening Tasks (unless the URL sets a view).
      </p>
      <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Default tasks view">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          type="button"
          class="rounded-md border px-3 py-1.5 text-body motion-color"
          :class="
            prefs.defaults.tasksView === option.value
              ? 'border-primary bg-elevated text-text'
              : 'border-line text-muted hover:bg-elevated'
          "
          @click="setDefault({ tasksView: option.value })"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="text-body font-medium text-text">Landing page</p>
      <p class="mt-1 text-body text-muted">Where you land after sign-in and when opening SpecFlow.</p>
      <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Default landing page">
        <button
          v-for="option in landingOptions"
          :key="option.value"
          type="button"
          class="rounded-md border px-3 py-1.5 text-body motion-color"
          :class="
            prefs.defaults.landingPage === option.value
              ? 'border-primary bg-elevated text-text'
              : 'border-line text-muted hover:bg-elevated'
          "
          @click="setDefault({ landingPage: option.value })"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="text-body font-medium text-text">Tasks scope</p>
      <p class="mt-1 text-body text-muted">
        Prefill the assignee filter when Tasks has no assignee in the URL.
      </p>
      <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Default tasks scope">
        <button
          v-for="option in scopeOptions"
          :key="option.value"
          type="button"
          class="rounded-md border px-3 py-1.5 text-body motion-color"
          :class="
            prefs.defaults.tasksScope === option.value
              ? 'border-primary bg-elevated text-text'
              : 'border-line text-muted hover:bg-elevated'
          "
          @click="setDefault({ tasksScope: option.value })"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </section>
</template>
