<script setup lang="ts">
import type { Task, TaskStatus } from '@/types'
import { priorityClass, taskStatusLabel, taskStatuses } from '@/utils/status'
import Select from '@/components/ui/Select.vue'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ open: []; status: [TaskStatus] }>()

const statusOptions = taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] }))

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function onDragStart(event: DragEvent): void {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('text/task-id', props.task.id)
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <article
    draggable="true"
    class="sf-panel cursor-grab px-3 py-2.5 active:cursor-grabbing"
    @click="emit('open')"
    @dragstart="onDragStart"
  >
    <p class="text-body font-medium leading-snug">{{ task.title }}</p>
    <div class="mt-2 flex items-center gap-2">
      <span class="text-label capitalize" :class="priorityClass[task.priority]">{{ task.priority }}</span>
      <span
        v-if="task.assignedTo"
        class="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-elevated font-mono text-label text-primary"
        :title="task.assignedTo.name"
      >
        {{ initials(task.assignedTo.name) }}
      </span>
    </div>
    <div class="mt-2" @click.stop>
      <Select
        :id="`board-status-${task.id}`"
        :model-value="task.status"
        label=""
        compact
        :options="statusOptions"
        @update:model-value="emit('status', $event as TaskStatus)"
      />
    </div>
  </article>
</template>
