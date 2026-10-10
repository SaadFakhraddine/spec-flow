<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useActivity } from '@/composables/useActivity'
import { useAuth } from '@/composables/useAuth'
import { activityLabel } from '@/utils/activityLabel'
import { formatRelative } from '@/utils/format'

const props = defineProps<{
  taskId?: string
  specId?: string
  recent?: boolean
  emptyMessage?: string
}>()

const { user } = useAuth()
const { items, isLoading, loadForTask, loadForSpec, loadRecent } = useActivity()

async function load(): Promise<void> {
  if (props.taskId) await loadForTask(props.taskId)
  else if (props.specId) await loadForSpec(props.specId)
  else if (props.recent) await loadRecent()
}

function labelFor(item: Parameters<typeof activityLabel>[0]): string {
  return activityLabel(item, user.value?.id)
}

onMounted(() => {
  void load()
})
watch(
  () => [props.taskId, props.specId],
  () => {
    void load()
  },
)
</script>

<template>
  <section class="sf-panel flex min-h-0 flex-col p-4">
    <h2 class="shrink-0 text-section font-medium">Activity</h2>
    <p v-if="isLoading" class="mt-3 text-body text-muted">Loading activity…</p>
    <p v-else-if="items.length === 0" class="mt-3 text-body text-muted">
      {{ emptyMessage ?? 'No activity yet.' }}
    </p>
    <ul
      v-else
      class="mt-3 max-h-52 space-y-2 overflow-y-auto overscroll-contain pr-1 md:max-h-64"
    >
      <li v-for="item in items" :key="item.id" class="border-b border-line pb-1.5 last:border-b-0">
        <p class="text-body">
          <RouterLink
            v-if="item.taskId && recent"
            :to="`/tasks/${item.taskId}`"
            class="text-primary hover:brightness-110"
          >
            {{ labelFor(item) }}
          </RouterLink>
          <RouterLink
            v-else-if="item.specId && recent"
            :to="`/specs/${item.specId}`"
            class="text-primary hover:brightness-110"
          >
            {{ labelFor(item) }}
          </RouterLink>
          <span v-else>{{ labelFor(item) }}</span>
        </p>
        <p class="mt-0.5 font-mono text-label text-muted">{{ formatRelative(item.createdAt) }}</p>
      </li>
    </ul>
  </section>
</template>
