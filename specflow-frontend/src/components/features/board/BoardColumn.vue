<script setup lang="ts">
import { ref } from 'vue'
import type { Task, TaskStatus } from '@/types'
import { taskStatusLabel } from '@/utils/status'
import BoardCard from './BoardCard.vue'

defineProps<{ status: TaskStatus; tasks: Task[] }>()
const emit = defineEmits<{
  open: [string]
  status: [id: string, status: TaskStatus]
  drop: [taskId: string, status: TaskStatus]
}>()

const isDropTarget = ref(false)

function onDragOver(event: DragEvent): void {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  isDropTarget.value = true
}

function onDragLeave(event: DragEvent): void {
  const next = event.relatedTarget as Node | null
  if (next && (event.currentTarget as HTMLElement).contains(next)) return
  isDropTarget.value = false
}

function onDrop(event: DragEvent, status: TaskStatus): void {
  event.preventDefault()
  isDropTarget.value = false
  const taskId = event.dataTransfer?.getData('text/task-id')
  if (taskId) emit('drop', taskId, status)
}
</script>

<template>
  <section
    class="flex min-h-[16rem] w-[78vw] max-w-[18rem] shrink-0 flex-col rounded-md border border-line bg-surface/50 motion-color sm:min-w-[14rem] sm:w-auto sm:max-w-none sm:flex-1"
    :class="isDropTarget ? 'cursor-pointer border-primary bg-primary/10 ring-1 ring-primary/40' : ''"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop($event, status)"
  >
    <header class="flex items-center justify-between border-b border-line px-3 py-2">
      <h3 class="text-body font-medium">{{ taskStatusLabel[status] }}</h3>
      <span class="font-mono text-label text-muted">{{ tasks.length }}</span>
    </header>
    <div class="flex flex-1 flex-col gap-2 p-2" :class="isDropTarget ? 'cursor-pointer' : ''">
      <BoardCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @open="emit('open', task.id)"
        @status="emit('status', task.id, $event)"
      />
      <p v-if="isDropTarget" class="mt-auto py-3 text-center text-label text-primary">Drop here</p>
    </div>
  </section>
</template>
