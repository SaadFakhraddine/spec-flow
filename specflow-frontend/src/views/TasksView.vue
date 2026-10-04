<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUsers } from '@/composables/useDashboard'
import { useTasks } from '@/composables/useTasks'
import { useToast } from '@/composables/useToast'
import type { TaskInput, TaskStatus } from '@/types'
import { PAGE_LIMIT } from '@/types'
import { taskStatuses } from '@/utils/status'
import { moveTaskOnBoard, type BoardColumns } from '@/utils/boardMove'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import BulkActionBar from '@/components/features/BulkActionBar.vue'
import CreateTaskDrawer from '@/components/features/CreateTaskDrawer.vue'
import SavedFilterChips from '@/components/features/SavedFilterChips.vue'
import TaskFilters from '@/components/features/TaskFilters.vue'
import TaskTableRow from '@/components/features/TaskTableRow.vue'
import TaskMobileCard from '@/components/features/TaskMobileCard.vue'
import TaskBoard from '@/components/features/board/TaskBoard.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const { users, load: loadUsers } = useUsers()
const {
  tasks, total, currentPage, isLoading, error, filters,
  fetchTasks, fetchBoardColumns, createTask, updateTask, patchTaskQuiet, bulkUpdate,
} = useTasks()

const creating = ref(false)
const drawerRef = ref<{ stopSaving: () => void } | null>(null)
const board = ref<BoardColumns | null>(null)
const selected = ref<string[]>([])
const view = computed(() => (route.query.view === 'board' ? 'board' : 'list'))
const isAdmin = computed(() => user.value?.role === 'admin')
const hasFilters = computed(() =>
  Boolean(
    filters.value.status ||
      filters.value.priority ||
      filters.value.assignedTo ||
      filters.value.q ||
      filters.value.due ||
      filters.value.blocked,
  ),
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
    due: filters.value.due,
    blocked: filters.value.blocked,
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
watch(filters, () => {
  selected.value = []
  load()
}, { deep: true })
watch(view, () => {
  selected.value = []
  load()
})

function open(id: string): void {
  void router.push(`/tasks/${id}`)
}

function toggleSelect(id: string, on: boolean): void {
  selected.value = on ? [...new Set([...selected.value, id])] : selected.value.filter((item) => item !== id)
}

function toggleAll(on: boolean): void {
  selected.value = on ? tasks.value.map((task) => task.id) : []
}

async function onBulkStatus(status: TaskStatus): Promise<void> {
  const count = await bulkUpdate(selected.value, { status })
  if (count == null) {
    toast.error(error.value || 'Bulk update failed')
    return
  }
  selected.value = []
  toast.success(`Updated ${count} task(s)`)
  load()
}

async function onBulkAssign(userId: string): Promise<void> {
  const count = await bulkUpdate(selected.value, { assignedTo: userId })
  if (count == null) {
    toast.error(error.value || 'Bulk assign failed')
    return
  }
  selected.value = []
  toast.success(`Assigned ${count} task(s)`)
  load()
}

async function onStatus(id: string, status: TaskStatus): Promise<void> {
  if (view.value === 'board' && board.value) {
    const { next, previous, moved } = moveTaskOnBoard(board.value, id, status)
    if (!moved) return
    board.value = next
    const updated = await patchTaskQuiet(id, { status })
    if (!updated) {
      board.value = previous
      toast.error(error.value || 'Could not update status')
      return
    }
    toast.success('Status updated')
    return
  }
  const updated = await updateTask(id, { status })
  if (!updated) {
    toast.error(error.value || 'Could not update status')
    return
  }
  toast.success('Status updated')
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

    <SavedFilterChips :filters="filters" @apply="filters = $event" />
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
      <div v-else class="space-y-2 md:hidden">
        <TaskMobileCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @open="open(task.id)"
          @status="onStatus(task.id, $event)"
        />
      </div>
      <div v-if="total > 0" class="hidden overflow-hidden sf-panel md:block">
        <table class="sf-table">
          <thead>
            <tr>
              <th class="w-10">
                <input
                  type="checkbox"
                  class="rounded border-line"
                  :checked="tasks.length > 0 && selected.length === tasks.length"
                  aria-label="Select all tasks"
                  @change="toggleAll(($event.target as HTMLInputElement).checked)"
                />
              </th>
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
              :selected="selected.includes(task.id)"
              @open="open(task.id)"
              @status="onStatus(task.id, $event)"
              @toggle="toggleSelect(task.id, $event)"
            />
          </tbody>
        </table>
      </div>
      <BulkActionBar
        v-if="selected.length"
        :count="selected.length"
        :is-admin="isAdmin"
        :users="users"
        @status="onBulkStatus"
        @assign="onBulkAssign"
        @clear="selected = []"
      />
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
