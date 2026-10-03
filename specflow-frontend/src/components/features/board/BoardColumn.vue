<script setup lang="ts">
import type { Task, TaskStatus } from '@/types'
import { taskStatusLabel } from '@/utils/status'
import BoardCard from './BoardCard.vue'

defineProps<{ status: TaskStatus; tasks: Task[] }>()
const emit = defineEmits<{
  open: [string]
  status: [id: string, status: TaskStatus]
  drop: [taskId: string, status: TaskStatus]
}>()

function onDrop(event: DragEvent, status: TaskStatus): void {
  const taskId = event.dataTransfer?.getData('text/task-id')
  if (taskId) emit('drop', taskId, status)
}
</script>

<template>
  <section
    class="flex min-h-[16rem] w-[78vw] max-w-[18rem] shrink-0 flex-col rounded-md border border-line bg-surface/50 sm:min-w-[14rem] sm:w-auto sm:max-w-none sm:flex-1"
    @dragover.prevent
    @drop.prevent="onDrop($event, status)"
  >
    <header class="flex items-center justify-between border-b border-line px-3 py-2">
      <h3 class="text-body font-medium">{{ taskStatusLabel[status] }}</h3>
      <span class="font-mono text-label text-muted">{{ tasks.length }}</span>
    </header>
    <div class="flex flex-col gap-2 p-2">
      <BoardCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @open="emit('open', task.id)"
        @status="emit('status', task.id, $event)"
      />
    </div>
  </section>
</template>
