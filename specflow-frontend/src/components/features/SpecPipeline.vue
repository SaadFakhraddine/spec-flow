<script setup lang="ts">
import type { Spec, SpecStatus } from '@/types'
import { specBorder, specStatusLabel, specStatuses } from '@/utils/status'
import SpecCoverageChip from '@/components/features/SpecCoverageChip.vue'

defineProps<{ columns: Record<SpecStatus, Spec[]> }>()
const emit = defineEmits<{ open: [string] }>()
</script>

<template>
  <div class="flex gap-3 overflow-x-auto pb-2">
    <section
      v-for="status in specStatuses"
      :key="status"
      class="sf-panel flex w-64 shrink-0 flex-col p-3"
    >
      <header class="mb-2 flex items-center justify-between gap-2">
        <h2 class="text-section font-medium">{{ specStatusLabel[status] }}</h2>
        <span class="font-mono text-label text-muted">{{ columns[status]?.length ?? 0 }}</span>
      </header>
      <ul class="flex min-h-[8rem] flex-col gap-2">
        <li v-if="!(columns[status]?.length)" class="text-label text-muted">No specs</li>
        <li
          v-for="spec in columns[status]"
          :key="spec.id"
          class="cursor-pointer rounded-md border border-line border-l-2 bg-elevated p-2.5 motion-color hover:border-primary/40"
          :class="specBorder[spec.status]"
          tabindex="0"
          @click="emit('open', spec.id)"
          @keydown.enter="emit('open', spec.id)"
        >
          <p class="text-body font-medium text-text">{{ spec.title }}</p>
          <div class="mt-1.5 flex flex-wrap items-center gap-2">
            <SpecCoverageChip :task-count="spec.taskCount" :tasks-done="spec.tasksDone" />
            <span v-if="spec.archivedAt" class="sf-chip bg-surface text-muted">Archived</span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
