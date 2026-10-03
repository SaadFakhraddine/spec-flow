<script setup lang="ts">
import type { Task, TaskStatus } from '@/types'
import { formatDate } from '@/utils/format'
import { priorityClass, taskBorder, taskStatusLabel, taskStatuses } from '@/utils/status'
import Select from '@/components/ui/Select.vue'

defineProps<{ task: Task }>()
const emit = defineEmits<{ open: []; status: [TaskStatus] }>()

const statusOptions = taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] }))
</script>

<template>
  <article class="sf-panel border-l-2 px-3 py-3" :class="taskBorder[task.status]">
    <button type="button" class="w-full text-left text-body font-medium" @click="emit('open')">
      {{ task.title }}
    </button>
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <span class="text-label capitalize" :class="priorityClass[task.priority]">{{ task.priority }}</span>
      <span class="text-label text-muted">{{ task.assignedTo?.name ?? 'Unassigned' }}</span>
      <span class="ml-auto font-mono text-label text-muted">{{ formatDate(task.dueDate) }}</span>
    </div>
    <div class="mt-2">
      <Select
        :id="`mobile-status-${task.id}`"
        :model-value="task.status"
        label=""
        compact
        :options="statusOptions"
        @update:model-value="emit('status', $event as TaskStatus)"
      />
    </div>
  </article>
</template>
