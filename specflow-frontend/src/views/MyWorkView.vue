<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMyWork } from '@/composables/useMyWork'
import type { Task } from '@/types'
import { formatDate } from '@/utils/format'
import { priorityClass, taskStatusLabel } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'

const SECTION_CAP = 5
const { work, isLoading, error, load } = useMyWork()

const sections = computed(() => {
  const blockedIds = new Set(work.value.blocked.map((task) => task.id))
  const watching = work.value.watching.filter((task) => !blockedIds.has(task.id))
  return [
    { key: 'assigned', title: 'Assigned', items: work.value.assigned },
    { key: 'watching', title: 'Watching', items: watching },
    { key: 'mentioned', title: 'Mentioned', items: work.value.mentioned },
    { key: 'blocked', title: 'Blocked', items: work.value.blocked },
    { key: 'overdue', title: 'Overdue', items: work.value.overdue },
  ]
    .filter((section) => section.items.length > 0)
    .map((section) => ({
      ...section,
      visible: section.items.slice(0, SECTION_CAP),
      extra: Math.max(0, section.items.length - SECTION_CAP),
    }))
})

const isEmpty = computed(() => sections.value.length === 0)

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
    <LoadingSkeleton v-if="isLoading" :rows="3" />
    <div v-else-if="error">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
    </div>
    <p v-else-if="isEmpty" class="text-body text-muted">Nothing in your queue right now.</p>
    <div v-else class="space-y-5">
      <section v-for="section in sections" :key="section.key">
        <h2 class="text-body font-medium text-muted">
          {{ section.title }}
          <span class="font-mono text-label">{{ section.items.length }}</span>
        </h2>
        <ul class="mt-1.5 divide-y divide-line border-y border-line">
          <li v-for="task in section.visible" :key="`${section.key}-${task.id}`">
            <RouterLink
              :to="`/tasks/${task.id}`"
              class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2 motion-color hover:bg-elevated/60"
            >
              <span class="min-w-0 text-body">
                {{ task.title }}
                <span
                  v-if="task.blocked && section.key !== 'blocked'"
                  class="ml-1.5 align-middle text-label text-danger"
                >
                  Blocked
                </span>
              </span>
              <span class="shrink-0 font-mono text-label text-muted" :class="priorityClass[task.priority]">
                {{ meta(task) }}
              </span>
            </RouterLink>
          </li>
        </ul>
        <RouterLink
          v-if="section.extra > 0"
          to="/tasks"
          class="mt-1.5 inline-block text-label text-primary hover:brightness-110"
        >
          +{{ section.extra }} more in Tasks
        </RouterLink>
      </section>
    </div>
  </PageWrapper>
</template>
