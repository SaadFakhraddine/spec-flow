<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PaginatedResponse, Task } from '@/types'
import apiClient from '@/composables/useApi'
import { useFocusTrap } from '@/composables/useFocusTrap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const props = defineProps<{ linkedIds: string[] }>()
const emit = defineEmits<{ close: []; pick: [string] }>()
const query = ref('')
const tasks = ref<Task[]>([])
const panel = ref<HTMLElement | null>(null)
useFocusTrap(panel, { onEscape: () => emit('close') })

async function search(): Promise<void> {
  const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
    params: { q: query.value, limit: 20 },
  })
  tasks.value = response.data.data.filter((task) => !props.linkedIds.includes(task.id))
}

watch(query, () => {
  void search()
})
void search()
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-start justify-center bg-background/80 px-4 pt-20"
    role="presentation"
    @click.self="emit('close')"
  >
    <div
      ref="panel"
      class="w-full max-w-lg rounded-md border border-line bg-surface p-5 shadow-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Link a task"
    >
      <h2 class="text-section font-medium">Link an existing task</h2>
      <div class="mt-4">
        <Input id="task-search" v-model="query" label="Search by title" />
      </div>
      <ul class="mt-4 max-h-64 overflow-auto">
        <li v-for="task in tasks" :key="task.id" class="border-b border-line">
          <button
            type="button"
            class="w-full px-2 py-2 text-left text-body hover:bg-elevated"
            @click="emit('pick', task.id)"
          >
            {{ task.title }}
          </button>
        </li>
        <li v-if="tasks.length === 0" class="px-2 py-3 text-body text-muted">No matching tasks.</li>
      </ul>
      <div class="mt-4 flex justify-end">
        <Button variant="ghost" @click="emit('close')">Cancel</Button>
      </div>
    </div>
  </div>
</template>
