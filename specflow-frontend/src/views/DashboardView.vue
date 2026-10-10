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
  const openLabel = user.value?.role === 'admin' ? 'Open tasks' : 'My open tasks'
  return [
    { label: openLabel, value: stats.value?.openTasks ?? 0, to: '/tasks' },
    { label: 'Overdue', value: stats.value?.overdueCount ?? 0, to: '/tasks?due=overdue' },
    { label: 'Blocked', value: stats.value?.blockedCount ?? 0, to: '/tasks?blocked=true' },
    { label: 'Specs in review', value: stats.value?.specsInReview ?? 0, to: '/specs?status=in-review' },
    { label: 'Completed this week', value: stats.value?.completedThisWeek ?? 0, to: '/tasks?status=done' },
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
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <RouterLink
          v-for="block in blocks"
          :key="block.label"
          :to="block.to"
          class="sf-panel px-4 py-3 motion-color hover:border-primary/40"
        >
          <p class="font-mono text-title text-primary">{{ block.value }}</p>
          <p class="mt-1 text-body text-muted">{{ block.label }}</p>
        </RouterLink>
      </div>
      <div class="mt-8">
        <ActivityTimeline recent empty-message="Actions on tasks and specs will show up here." />
      </div>
    </template>
  </PageWrapper>
</template>
