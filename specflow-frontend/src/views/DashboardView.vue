<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import { formatRelative } from '@/utils/format'
import { taskBorder, taskStatusLabel } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'

const { user } = useAuth()
const { stats, isLoading, error, load } = useDashboard()

const blocks = computed(() => {
  const openLabel = user.value?.role === 'admin' ? 'All open tasks' : 'My open tasks'
  return [
    { label: 'Total tasks', value: stats.value?.totalTasks ?? 0 },
    { label: openLabel, value: stats.value?.openTasks ?? 0 },
    { label: 'Specs in review', value: stats.value?.specsInReview ?? 0 },
    { label: 'Completed this week', value: stats.value?.completedThisWeek ?? 0 },
  ]
})

onMounted(() => {
  void load()
})
</script>

<template>
  <PageWrapper title="Dashboard">
    <p class="text-body text-muted">{{ user?.name }} · <span class="capitalize">{{ user?.role }}</span></p>
    <LoadingSkeleton v-if="isLoading" class="mt-8" :rows="2" />
    <div v-else-if="error" class="mt-8">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
    </div>
    <template v-else>
      <div class="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
        <div v-for="block in blocks" :key="block.label" class="border-b border-line pb-3">
          <p class="font-mono text-title">{{ block.value }}</p>
          <p class="mt-1 text-body text-muted">{{ block.label }}</p>
        </div>
      </div>
      <h2 class="mb-3 mt-10 text-section font-medium">Recent activity</h2>
      <ul>
        <li v-for="task in stats?.recentActivity ?? []" :key="task.id" class="flex items-baseline gap-4 border-b border-l-2 border-line px-3 py-2" :class="taskBorder[task.status]">
          <RouterLink :to="`/tasks/${task.id}`" class="text-body hover:text-primary">{{ task.title }}</RouterLink>
          <span class="text-label text-muted">{{ taskStatusLabel[task.status] }}</span>
          <span class="ml-auto font-mono text-label text-muted">{{ formatRelative(task.updatedAt) }}</span>
        </li>
      </ul>
      <div class="mt-8 flex gap-4">
        <RouterLink to="/tasks" class="text-body text-primary">Go to tasks</RouterLink>
        <RouterLink to="/specs" class="text-body text-primary">Go to specs</RouterLink>
      </div>
    </template>
  </PageWrapper>
</template>
