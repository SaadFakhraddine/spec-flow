<script setup lang="ts">
import type { DensityPref, ThemePref } from '@/types'
import { useAppearance } from '@/composables/useAppearance'
import { useToast } from '@/composables/useToast'

const { prefs, save } = useAppearance()
const toast = useToast()

const themes: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const densities: { value: DensityPref; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
]

async function patch(partial: Partial<typeof prefs.value>): Promise<void> {
  const ok = await save(partial)
  if (!ok) toast.error('Could not sync preferences')
}
</script>

<template>
  <div class="space-y-8">
    <section>
      <h2 class="text-section font-medium">Theme</h2>
      <p class="mt-1 text-body text-muted">Light, dark, or follow the OS.</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="option in themes"
          :key="option.value"
          type="button"
          class="rounded-md border px-3 py-1.5 text-body motion-color"
          :class="
            prefs.theme === option.value
              ? 'border-primary bg-elevated text-text'
              : 'border-line text-muted hover:bg-elevated'
          "
          @click="patch({ theme: option.value })"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section>
      <h2 class="text-section font-medium">Density</h2>
      <p class="mt-1 text-body text-muted">
        Compact shrinks page padding, controls, sidebar, and table rows so more fits on screen.
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="option in densities"
          :key="option.value"
          type="button"
          class="rounded-md border px-3 py-1.5 text-body motion-color"
          :class="
            prefs.density === option.value
              ? 'border-primary bg-elevated text-text'
              : 'border-line text-muted hover:bg-elevated'
          "
          @click="patch({ density: option.value })"
        >
          {{ option.label }}
        </button>
      </div>
    </section>
  </div>
</template>
