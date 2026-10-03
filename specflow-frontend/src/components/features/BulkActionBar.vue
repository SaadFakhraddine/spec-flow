<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TaskStatus, User } from '@/types'
import { taskStatusLabel, taskStatuses } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'

const props = defineProps<{
  count: number
  isAdmin: boolean
  users: User[]
}>()
const emit = defineEmits<{
  status: [TaskStatus]
  assign: [string]
  clear: []
}>()

const status = ref('')
const assignee = ref('')
const statusOptions = [
  { value: '', label: 'Set status…' },
  ...taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] })),
]
const assigneeOptions = computed(() => [
  { value: '', label: 'Assign to…' },
  ...props.users.map((person) => ({ value: person.id, label: person.name })),
])

function applyStatus(): void {
  if (!status.value) return
  emit('status', status.value as TaskStatus)
  status.value = ''
}

function applyAssign(): void {
  if (!assignee.value) return
  emit('assign', assignee.value)
  assignee.value = ''
}
</script>

<template>
  <div
    class="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 shadow-sm"
  >
    <p class="text-body font-medium">{{ count }} selected</p>
    <div class="w-40">
      <Select
        id="bulk-status"
        :model-value="status"
        label=""
        compact
        :options="statusOptions"
        @update:model-value="status = $event; applyStatus()"
      />
    </div>
    <div v-if="isAdmin" class="w-44">
      <Select
        id="bulk-assign"
        :model-value="assignee"
        label=""
        compact
        :options="assigneeOptions"
        @update:model-value="assignee = $event; applyAssign()"
      />
    </div>
    <Button variant="ghost" @click="emit('clear')">Clear</Button>
  </div>
</template>
