<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTasks } from '@/composables/useTasks'
import { useToast } from '@/composables/useToast'
import type { TaskInput } from '@/types'
import { PAGE_LIMIT } from '@/types'
import { formatDate } from '@/utils/format'
import { priorityClass, taskBorder, taskPriorities, taskStatusLabel, taskStatuses } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Select from '@/components/ui/Select.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import CreateTaskForm from '@/components/features/CreateTaskForm.vue'

const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const { tasks, total, currentPage, isLoading, error, filters, fetchTasks, createTask } = useTasks()
const creating = ref(false)
const formRef = ref<{ stopSaving: () => void } | null>(null)

const statusOptions = [{ value: '', label: 'All statuses' }, ...taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] }))]
const priorityOptions = [{ value: '', label: 'All priorities' }, ...taskPriorities.map((value) => ({ value, label: value[0]?.toUpperCase() + value.slice(1) }))]
const hasFilters = computed(() => Boolean(filters.value.status || filters.value.priority))

function load(page = currentPage.value): void {
  void fetchTasks({ status: filters.value.status, priority: filters.value.priority }, page)
}

onMounted(() => load(1))
watch(filters, () => load(1), { deep: true })

function open(id: string): void {
  void router.push(`/tasks/${id}`)
}

async function onCreate(input: TaskInput): Promise<void> {
  const created = await createTask(input)
  formRef.value?.stopSaving()
  if (!created) {
    toast.error(error.value || 'Could not create the task')
    return
  }
  creating.value = false
  toast.success('Task created')
  load(1)
}
</script>

<template>
  <PageWrapper title="Tasks">
    <template #actions>
      <Button v-if="user?.role === 'admin'" @click="creating = true">Create task</Button>
    </template>
    <FilterBar>
      <div class="w-48">
        <Select id="filter-status" v-model="filters.status" label="Status" :options="statusOptions" />
      </div>
      <div class="w-48">
        <Select id="filter-priority" v-model="filters.priority" label="Priority" :options="priorityOptions" />
      </div>
    </FilterBar>
    <div v-if="error" class="mb-4">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-2" variant="secondary" @click="load()">Retry</Button>
    </div>
    <LoadingSkeleton v-if="isLoading" />
    <EmptyState v-else-if="total === 0" :title="hasFilters ? 'No tasks match' : 'No tasks yet'" :message="hasFilters ? 'Clear the filters or create a task that fits.' : 'Tasks show up here once an admin adds the first one.'">
      <Button v-if="user?.role === 'admin' && !hasFilters" @click="creating = true">Create the first task</Button>
    </EmptyState>
    <table v-else class="w-full border-collapse text-left">
      <thead>
        <tr class="text-label text-muted">
          <th class="px-3 py-2 font-normal">Title</th>
          <th class="px-3 py-2 font-normal">Status</th>
          <th class="px-3 py-2 font-normal">Priority</th>
          <th class="px-3 py-2 font-normal">Assigned to</th>
          <th class="px-3 py-2 font-normal">Due date</th>
          <th class="px-3 py-2 font-normal">Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id" tabindex="0" class="cursor-pointer border-b border-l-2 border-line motion-color hover:bg-surface" :class="taskBorder[task.status]" @click="open(task.id)" @keydown.enter="open(task.id)">
          <td class="px-3 py-3 text-body">{{ task.title }}</td>
          <td class="px-3 py-3 text-body text-muted">{{ taskStatusLabel[task.status] }}</td>
          <td class="px-3 py-3 text-body capitalize" :class="priorityClass[task.priority]">{{ task.priority }}</td>
          <td class="px-3 py-3 text-body">{{ task.assignedTo?.name ?? 'Unassigned' }}</td>
          <td class="px-3 py-3 font-mono text-label">{{ formatDate(task.dueDate) }}</td>
          <td class="px-3 py-3 font-mono text-label text-muted">{{ formatDate(task.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
    <Pagination :page="currentPage" :total="total" :limit="PAGE_LIMIT" @change="load" />
    <Transition name="drawer">
      <aside v-if="creating" class="fixed inset-y-0 right-0 z-30 w-full max-w-md overflow-auto border-l border-line bg-background p-6">
        <h2 class="mb-4 text-section font-medium">New task</h2>
        <CreateTaskForm ref="formRef" @submit="onCreate" @cancel="creating = false" />
      </aside>
    </Transition>
  </PageWrapper>
</template>
