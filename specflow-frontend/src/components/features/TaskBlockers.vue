<script setup lang="ts">
import { ref, watch } from 'vue'
import apiClient from '@/composables/useApi'
import type { PaginatedResponse, Task, TaskRef } from '@/types'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'

const props = defineProps<{
  reason: string
  blockers: TaskRef[]
  taskId: string
}>()
const emit = defineEmits<{
  save: [payload: { blockedReason: string; blockedBy: string[] }]
}>()

const reason = ref(props.reason)
const selected = ref<TaskRef[]>([...props.blockers])
const query = ref('')
const hits = ref<Task[]>([])
const searching = ref(false)

watch(
  () => [props.reason, props.blockers] as const,
  ([nextReason, nextBlockers]) => {
    reason.value = nextReason
    selected.value = [...nextBlockers]
  },
)

async function search(): Promise<void> {
  const q = query.value.trim()
  if (!q) {
    hits.value = []
    return
  }
  searching.value = true
  try {
    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
      params: { q, limit: 8, page: 1 },
    })
    hits.value = response.data.data.filter(
      (task) => task.id !== props.taskId && !selected.value.some((item) => item.id === task.id),
    )
  } finally {
    searching.value = false
  }
}

function add(task: Task): void {
  selected.value = [...selected.value, { id: task.id, title: task.title }].slice(0, 10)
  query.value = ''
  hits.value = []
}

function remove(id: string): void {
  selected.value = selected.value.filter((item) => item.id !== id)
}

function save(): void {
  emit('save', {
    blockedReason: reason.value.trim(),
    blockedBy: selected.value.map((item) => item.id),
  })
}
</script>

<template>
  <section class="sf-panel space-y-3 p-4">
    <h2 class="text-section font-medium">Blockers</h2>
    <Textarea id="blocked-reason" v-model="reason" label="Blocked reason" :max="200" />
    <div>
      <Input
        id="blocker-search"
        v-model="query"
        label="Blocked by task"
        placeholder="Search task title…"
        @update:model-value="search"
      />
      <ul v-if="hits.length" class="mt-1 rounded-md border border-line bg-surface">
        <li v-for="task in hits" :key="task.id">
          <button type="button" class="w-full px-3 py-1.5 text-left text-body hover:bg-elevated" @click="add(task)">
            {{ task.title }}
          </button>
        </li>
      </ul>
      <p v-else-if="searching" class="mt-1 text-label text-muted">Searching…</p>
    </div>
    <ul v-if="selected.length" class="space-y-1">
      <li
        v-for="item in selected"
        :key="item.id"
        class="flex items-center justify-between rounded-md bg-elevated px-2 py-1 text-body"
      >
        <RouterLink class="text-primary" :to="`/tasks/${item.id}`">{{ item.title }}</RouterLink>
        <button type="button" class="text-label text-muted" @click="remove(item.id)">Remove</button>
      </li>
    </ul>
    <Button variant="secondary" @click="save">Save blockers</Button>
  </section>
</template>
