<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMyWork } from '@/composables/useMyWork'
import type { Task } from '@/types'
import { formatDate } from '@/utils/format'
import { priorityClass, taskStatusLabel } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'

const { work, isLoading, error, load } = useMyWork()

const sections = computed(() => [
  {
    key: 'assigned',
    title: 'Assigned',
    empty: 'Nothing assigned to you right now.',
    items: work.value.assigned,
  },
  {
    key: 'watching',
    title: 'Watching',
    empty: 'You are not watching any open tasks.',
    items: work.value.watching,
  },
  {
    key: 'mentioned',
    title: 'Mentioned',
    empty: 'No open tasks where you were mentioned.',
    items: work.value.mentioned,
  },
  {
    key: 'blocked',
    title: 'Blocked',
    empty: 'No blocked work on your plate.',
    items: work.value.blocked,
  },
  {
    key: 'overdue',
    title: 'Overdue',
    empty: 'No overdue assigned tasks.',
    items: work.value.overdue,
  },
])

function meta(task: Task): string {
  const parts = [taskStatusLabel[task.status], task.priority]
  if (task.dueDate) parts.push(`Due ${formatDate(task.dueDate)}`)
  return parts.join(' · ')
}

onMounted(() => {
  void load()
})
</script>

<template>
  <PageWrapper title="My work" subtitle="Your personal SpecFlow queue">
    <LoadingSkeleton v-if="isLoading" :rows="4" />
    <div v-else-if="error">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
    </div>
    <div v-else class="space-y-8">
      <section v-for="section in sections" :key="section.key">
        <h2 class="text-section font-medium">{{ section.title }}</h2>
        <p v-if="section.items.length === 0" class="mt-2 text-body text-muted">
          {{ section.empty }}
        </p>
        <ul v-else class="mt-3 space-y-2">
          <li v-for="task in section.items" :key="`${section.key}-${task.id}`">
            <RouterLink
              :to="`/tasks/${task.id}`"
              class="sf-panel sf-panel-pad block motion-color hover:border-primary/40"
            >
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-body font-medium">{{ task.title }}</span>
                <span
                  v-if="task.blocked"
                  class="sf-chip bg-danger/15 text-danger"
                >
                  Blocked
                </span>
              </div>
              <p class="mt-1 text-label text-muted">
                <span :class="priorityClass[task.priority]">{{ meta(task) }}</span>
              </p>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </PageWrapper>
</template>
