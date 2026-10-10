<script setup lang="ts">
import { computed } from 'vue'
import type { TaskFilters as Filters, User } from '@/types'
import { taskPriorities, taskStatusLabel, taskStatuses } from '@/utils/status'
import FilterBar from '@/components/ui/FilterBar.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import UserPicker from '@/components/ui/UserPicker.vue'

const props = defineProps<{
  modelValue: Filters
  users: User[]
  isAdmin: boolean
  currentUserId: string
}>()

const emit = defineEmits<{ 'update:modelValue': [Filters] }>()

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] })),
]
const priorityOptions = [
  { value: '', label: 'All priorities' },
  ...taskPriorities.map((value) => ({ value, label: value[0]?.toUpperCase() + value.slice(1) })),
]
const dueOptions = [
  { value: '', label: 'Any due date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'soon', label: 'Due in 7 days' },
]
const blockedOptions = [
  { value: '', label: 'Any blockers' },
  { value: 'true', label: 'Blocked only' },
]

function patch(partial: Partial<Filters>): void {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

function clear(): void {
  emit('update:modelValue', { status: '', priority: '', assignedTo: '', q: '', due: '', blocked: '' })
}

function myTasks(): void {
  if (props.modelValue.assignedTo === props.currentUserId) patch({ assignedTo: '' })
  else patch({ assignedTo: props.currentUserId })
}

const mineActive = computed(() => props.modelValue.assignedTo === props.currentUserId)
</script>

<template>
  <FilterBar class="!gap-2 !py-2">
    <div class="min-w-[11rem] flex-1">
      <Input
        id="filter-q"
        :model-value="modelValue.q ?? ''"
        label="Search"
        placeholder="Title contains…"
        @update:model-value="patch({ q: $event })"
      />
    </div>
    <div class="w-36">
      <Select
        id="filter-status"
        :model-value="modelValue.status ?? ''"
        label="Status"
        :options="statusOptions"
        @update:model-value="patch({ status: $event })"
      />
    </div>
    <div class="w-36">
      <Select
        id="filter-priority"
        :model-value="modelValue.priority ?? ''"
        label="Priority"
        :options="priorityOptions"
        @update:model-value="patch({ priority: $event })"
      />
    </div>
    <div v-if="isAdmin" class="w-48">
      <UserPicker
        id="filter-assignee"
        :model-value="modelValue.assignedTo ?? ''"
        label="Assignee"
        placeholder="Search assignee…"
        @update:model-value="patch({ assignedTo: $event })"
      />
    </div>
    <div class="w-40">
      <Select
        id="filter-due"
        :model-value="modelValue.due ?? ''"
        label="Due"
        :options="dueOptions"
        @update:model-value="patch({ due: $event })"
      />
    </div>
    <div class="w-36">
      <Select
        id="filter-blocked"
        :model-value="modelValue.blocked ?? ''"
        label="Blocked"
        :options="blockedOptions"
        @update:model-value="patch({ blocked: $event })"
      />
    </div>
    <!-- Spacer matches field labels so actions sit on the control baseline -->
    <div class="flex flex-col">
      <span class="mb-1 block text-label text-transparent select-none" aria-hidden="true">Actions</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="sf-toolbar-control inline-flex items-center rounded-md border text-label motion-color"
          :class="
            mineActive
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-line bg-elevated text-muted hover:border-primary/40 hover:text-text'
          "
          @click="myTasks"
        >
          My tasks
        </button>
        <button
          type="button"
          class="sf-toolbar-control inline-flex items-center rounded-md text-label text-muted motion-color hover:bg-elevated hover:text-text"
          @click="clear"
        >
          Clear
        </button>
      </div>
    </div>
  </FilterBar>
</template>
