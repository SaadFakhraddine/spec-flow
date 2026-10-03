<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useActivity } from '@/composables/useActivity'
import { activityLabel } from '@/utils/activityLabel'
import { formatRelative } from '@/utils/format'

const props = defineProps<{
  taskId?: string
  recent?: boolean
  emptyMessage?: string
}>()

const { items, isLoading, loadForTask, loadRecent } = useActivity()

async function load(): Promise<void> {
  if (props.taskId) await loadForTask(props.taskId)
  else if (props.recent) await loadRecent()
}

onMounted(() => {
  void load()
})
watch(
  () => props.taskId,
  () => {
    void load()
  },
)
</script>

<template>
  <section class="sf-panel p-4">
    <h2 class="text-section font-medium">Activity</h2>
    <p v-if="isLoading" class="mt-3 text-body text-muted">Loading activity…</p>
    <p v-else-if="items.length === 0" class="mt-3 text-body text-muted">
      {{ emptyMessage ?? 'No activity yet.' }}
    </p>
    <ul v-else class="mt-3 space-y-3">
      <li v-for="item in items" :key="item.id" class="border-b border-line pb-2 last:border-b-0">
        <p class="text-body">
          <RouterLink
            v-if="item.taskId && recent"
            :to="`/tasks/${item.taskId}`"
            class="text-primary hover:brightness-110"
          >
            {{ activityLabel(item) }}
          </RouterLink>
          <span v-else>{{ activityLabel(item) }}</span>
        </p>
        <p class="mt-0.5 font-mono text-label text-muted">{{ formatRelative(item.createdAt) }}</p>
      </li>
    </ul>
  </section>
</template>
