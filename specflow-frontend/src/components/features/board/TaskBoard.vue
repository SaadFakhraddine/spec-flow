<script setup lang="ts">
import type { Task, TaskStatus } from '@/types'
import { taskStatuses } from '@/utils/status'
import BoardColumn from './BoardColumn.vue'

defineProps<{ columns: Record<TaskStatus, Task[]> }>()
const emit = defineEmits<{
  open: [string]
  status: [id: string, status: TaskStatus]
}>()
</script>

<template>
  <div class="flex gap-3 overflow-x-auto pb-2">
    <BoardColumn
      v-for="status in taskStatuses"
      :key="status"
      :status="status"
      :tasks="columns[status] ?? []"
      @open="emit('open', $event)"
      @status="(id, next) => emit('status', id, next)"
      @drop="(id, next) => emit('status', id, next)"
    />
  </div>
</template>
