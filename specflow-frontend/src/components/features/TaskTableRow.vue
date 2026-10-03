<script setup lang="ts">
import type { Task, TaskStatus } from '@/types'
import { formatDate } from '@/utils/format'
import { priorityClass, taskBorder, taskStatusLabel, taskStatuses } from '@/utils/status'
import Select from '@/components/ui/Select.vue'

defineProps<{ task: Task }>()
const emit = defineEmits<{ open: []; status: [TaskStatus] }>()

const statusOptions = taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] }))

function onStatus(value: string): void {
  emit('status', value as TaskStatus)
}

function onRowClick(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (target.closest('select, label')) return
  emit('open')
}
</script>

<template>
  <tr
    tabindex="0"
    class="cursor-pointer border-l-2 border-line"
    :class="taskBorder[task.status]"
    @click="onRowClick"
    @keydown.enter="emit('open')"
  >
    <td class="px-3 py-2.5 text-body">{{ task.title }}</td>
    <td class="px-3 py-2.5" @click.stop>
      <Select
        :id="`status-${task.id}`"
        :model-value="task.status"
        label=""
        compact
        :options="statusOptions"
        @update:model-value="onStatus"
      />
    </td>
    <td class="px-3 py-2.5 text-body capitalize" :class="priorityClass[task.priority]">
      {{ task.priority }}
    </td>
    <td class="px-3 py-2.5 text-body">{{ task.assignedTo?.name ?? 'Unassigned' }}</td>
    <td class="px-3 py-2.5 font-mono text-label">{{ formatDate(task.dueDate) }}</td>
    <td class="px-3 py-2.5 font-mono text-label text-muted">{{ formatDate(task.createdAt) }}</td>
  </tr>
</template>
