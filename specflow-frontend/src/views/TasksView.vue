<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUsers } from '@/composables/useDashboard'
import { useTasks } from '@/composables/useTasks'
import { useToast } from '@/composables/useToast'
import type { Task, TaskInput, TaskStatus } from '@/types'
import { PAGE_LIMIT } from '@/types'
import { taskStatuses } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import CreateTaskDrawer from '@/components/features/CreateTaskDrawer.vue'
import TaskFilters from '@/components/features/TaskFilters.vue'
import TaskTableRow from '@/components/features/TaskTableRow.vue'
import TaskBoard from '@/components/features/board/TaskBoard.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const { users, load: loadUsers } = useUsers()
const {
  tasks, total, currentPage, isLoading, error, filters,
  fetchTasks, fetchBoardColumns, createTask, updateTask,
} = useTasks()

const creating = ref(false)
const drawerRef = ref<{ stopSaving: () => void } | null>(null)
const board = ref<Record<TaskStatus, Task[]> | null>(null)
const view = computed(() => (route.query.view === 'board' ? 'board' : 'list'))
const isAdmin = computed(() => user.value?.role === 'admin')
const hasFilters = computed(() =>
  Boolean(filters.value.status || filters.value.priority || filters.value.assignedTo || filters.value.q),
)
const emptyBoard = computed(() =>
  !board.value || taskStatuses.every((status) => (board.value?.[status]?.length ?? 0) === 0),
)

function listParams() {
  return {
    status: filters.value.status,
    priority: filters.value.priority,
    assignedTo: filters.value.assignedTo,
    q: filters.value.q,
  }
}

async function loadList(page = currentPage.value): Promise<void> {
  await fetchTasks(listParams(), page)
}

async function loadBoard(): Promise<void> {
  const { status: _status, ...rest } = listParams()
  board.value = await fetchBoardColumns(rest)
}

function load(): void {
  if (view.value === 'board') void loadBoard()
  else void loadList(1)
}

function setView(next: 'list' | 'board'): void {
  void router.replace({ query: next === 'board' ? { view: 'board' } : {} })
}

onMounted(() => {
  if (isAdmin.value) void loadUsers()
  load()
})
watch(filters, () => load(), { deep: true })
watch(view, () => load())

function open(id: string): void {
  void router.push(`/tasks/${id}`)
}

async function onStatus(id: string, status: TaskStatus): Promise<void> {
  const updated = await updateTask(id, { status })
  if (!updated) {
    toast.error(error.value || 'Could not update status')
    return
  }
  toast.success('Status updated')
  if (view.value === 'board') await loadBoard()
}

async function onCreate(input: TaskInput): Promise<void> {
  const created = await createTask(input)
  drawerRef.value?.stopSaving()
  if (!created) {
    toast.error(error.value || 'Could not create the task')
    return
  }
  creating.value = false
  toast.success('Task created')
  load()
}
</script>

<template>
  <PageWrapper title="Tasks" subtitle="Track work from backlog to done">
    <template #actions>
      <div class="flex rounded-md border border-line bg-elevated p-0.5">
        <button
          type="button"
          class="rounded px-3 py-1 text-body motion-color"
          :class="view === 'list' ? 'bg-surface text-text' : 'text-muted'"
          @click="setView('list')"
        >
          List
        </button>
        <button
          type="button"
          class="rounded px-3 py-1 text-body motion-color"
          :class="view === 'board' ? 'bg-surface text-text' : 'text-muted'"
          @click="setView('board')"
        >
          Board
        </button>
      </div>
      <Button v-if="isAdmin" @click="creating = true">Create task</Button>
    </template>

    <TaskFilters v-model="filters" :users="users" :is-admin="isAdmin" :current-user-id="user?.id ?? ''" />
    <div v-if="error" class="mb-4">
      <p class="text-body text-danger">{{ error }}</p>
      <Button class="mt-2" variant="secondary" @click="load">Retry</Button>
    </div>
    <LoadingSkeleton v-if="isLoading" />

    <template v-else-if="view === 'list'">
      <EmptyState
        v-if="total === 0"
        :title="hasFilters ? 'No tasks match' : 'No tasks yet'"
        :message="hasFilters ? 'Clear the filters or create a task that fits.' : 'Tasks show up here once an admin adds the first one.'"
      >
        <Button v-if="isAdmin && !hasFilters" @click="creating = true">Create the first task</Button>
      </EmptyState>
      <div v-else class="sf-panel overflow-hidden">
        <table class="sf-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned to</th>
              <th>Due date</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <TaskTableRow
              v-for="task in tasks"
              :key="task.id"
              :task="task"
              @open="open(task.id)"
              @status="onStatus(task.id, $event)"
            />
          </tbody>
        </table>
      </div>
      <Pagination :page="currentPage" :total="total" :limit="PAGE_LIMIT" @change="loadList" />
    </template>

    <template v-else>
      <EmptyState
        v-if="emptyBoard"
        :title="hasFilters ? 'No tasks match' : 'No tasks yet'"
        :message="hasFilters ? 'Clear the filters or create a task that fits.' : 'Tasks show up on the board once work exists.'"
      />
      <TaskBoard v-else-if="board" :columns="board" @open="open" @status="onStatus" />
    </template>

    <CreateTaskDrawer ref="drawerRef" :open="creating" @submit="onCreate" @cancel="creating = false" />
  </PageWrapper>
</template>
