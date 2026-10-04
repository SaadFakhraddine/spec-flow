<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import Button from '@/components/ui/Button.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import ActivityTimeline from '@/components/features/ActivityTimeline.vue'

const { user } = useAuth()
const { stats, isLoading, error, load } = useDashboard()

const blocks = computed(() => {
  const openLabel = user.value?.role === 'admin' ? 'All open tasks' : 'My open tasks'
  return [
    { label: 'Total tasks', value: stats.value?.totalTasks ?? 0 },
    { label: openLabel, value: stats.value?.openTasks ?? 0 },
    { label: 'Overdue', value: stats.value?.overdueCount ?? 0 },
    { label: 'Due in 7 days', value: stats.value?.dueSoonCount ?? 0 },
    { label: 'Blocked', value: stats.value?.blockedCount ?? 0 },
    { label: 'Open without spec', value: stats.value?.unspeccedOpenCount ?? 0 },
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
      <RouterLink to="/my-work" class="text-body text-primary motion-color hover:brightness-110">My work</RouterLink>
      <RouterLink to="/tasks" class="text-body text-primary motion-color hover:brightness-110">Go to tasks</RouterLink>
      <RouterLink to="/specs" class="text-body text-primary motion-color hover:brightness-110">Go to specs</RouterLink>
    </template>
    <LoadingSkeleton v-if="isLoading" :rows="2" />
    <div v-else-if="error">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-3" variant="secondary" @click="load">Retry</Button>
    </div>
    <template v-else>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div v-for="block in blocks" :key="block.label" class="sf-panel px-4 py-3">
          <p class="font-mono text-title text-primary">{{ block.value }}</p>
          <p class="mt-1 text-body text-muted">{{ block.label }}</p>
        </div>
      </div>
      <div class="mt-8">
        <ActivityTimeline recent empty-message="Actions on tasks and specs will show up here." />
      </div>
    </template>
  </PageWrapper>
</template>
