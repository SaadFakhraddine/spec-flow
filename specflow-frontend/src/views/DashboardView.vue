<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import { formatRelative } from '@/utils/format'
import { taskBorder, taskStatusLabel } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
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
  <PageWrapper title="Dashboard" :subtitle="`${user?.name ?? ''} · ${user?.role ?? ''}`">
    <template #actions>
      <RouterLink to="/tasks" class="text-body text-primary motion-color hover:brightness-110">Go to tasks</RouterLink>
      <RouterLink to="/specs" class="text-body text-primary motion-color hover:brightness-110">Go to specs</RouterLink>
    </template>
    <LoadingSkeleton v-if="isLoading" :rows="2" />
    <div v-else-if="error">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
    </div>
    <template v-else>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div
          v-for="block in blocks"
          :key="block.label"
          class="sf-panel px-4 py-3"
        >
          <p class="font-mono text-title text-primary">{{ block.value }}</p>
          <p class="mt-1 text-body text-muted">{{ block.label }}</p>
        </div>
      </div>
      <div class="mt-8">
        <h2 class="mb-3 text-section font-medium">Recent activity</h2>
        <EmptyState
          v-if="!(stats?.recentActivity?.length)"
          title="No recent activity"
          message="Tasks you touch will show up here."
        />
        <ul v-else class="sf-panel overflow-hidden">
          <li
            v-for="task in stats?.recentActivity ?? []"
            :key="task.id"
            class="flex items-baseline gap-4 border-b border-l-2 border-line px-4 py-2.5 last:border-b-0"
            :class="taskBorder[task.status]"
          >
            <RouterLink :to="`/tasks/${task.id}`" class="text-body hover:text-primary">
              {{ task.title }}
            </RouterLink>
            <span class="sf-chip bg-elevated text-muted">{{ taskStatusLabel[task.status] }}</span>
            <span class="ml-auto font-mono text-label text-muted">{{ formatRelative(task.updatedAt) }}</span>
          </li>
        </ul>
      </div>
    </template>
  </PageWrapper>
</template>
