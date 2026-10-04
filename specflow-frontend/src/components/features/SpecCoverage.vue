<script setup lang="ts">
import { computed } from 'vue'
import type { Spec } from '@/types'

const props = defineProps<{ spec: Spec }>()

const total = computed(() => props.spec.tasks.length)
const done = computed(() => props.spec.tasks.filter((task) => task.status === 'done').length)
const open = computed(() => total.value - done.value)
const pct = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0))
const approvedGap = computed(() => props.spec.status === 'approved' && open.value > 0)
</script>

<template>
  <section class="sf-panel space-y-2 p-4">
    <h2 class="text-section font-medium">Task coverage</h2>
    <p class="text-body text-muted">
      {{ done }} of {{ total }} linked tasks done
      <span v-if="total">({{ pct }}%)</span>
    </p>
    <div class="h-2 overflow-hidden rounded bg-elevated">
      <div class="h-full bg-primary motion-color" :style="{ width: `${pct}%` }" />
    </div>
    <p v-if="total === 0" class="text-label text-muted">No tasks linked yet.</p>
    <p v-else-if="approvedGap" class="text-label text-danger">
      Spec is approved but {{ open }} linked task(s) are still open.
    </p>
  </section>
</template>
