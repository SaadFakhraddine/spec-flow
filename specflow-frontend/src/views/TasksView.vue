<script setup lang="ts">
import { useTasksPage } from '@/composables/useTasksPage'
import { PAGE_LIMIT } from '@/types'
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

const {
  user,
  users,
  tasks,
  total,
  currentPage,
  isLoading,
  error,
  filters,
  creating,
  drawerRef,
  board,
  selected,
  view,
  isAdmin,
  hasFilters,
  emptyBoard,
  load,
  loadList,
  setView,
  open,
  toggleSelect,
  toggleAll,
  onBulkStatus,
  onBulkAssign,
  onStatus,
  onCreate,
} = useTasksPage()
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
