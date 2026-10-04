<script setup lang="ts">
import { ref } from 'vue'
import type { TaskStatus, User } from '@/types'
import { taskStatusLabel, taskStatuses } from '@/utils/status'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import UserPicker from '@/components/ui/UserPicker.vue'

defineProps<{
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
const statusOptions = [
  { value: '', label: 'Set status…' },
  ...taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] })),
]

function applyStatus(value: string): void {
  status.value = value
  if (!value) return
  emit('status', value as TaskStatus)
  status.value = ''
}

function applyAssign(userId: string): void {
  if (!userId) return
  emit('assign', userId)
}
</script>

<template>
  <div
    class="sticky bottom-4 z-20 flex flex-wrap items-end gap-3 rounded-md border border-line bg-surface px-4 py-3 shadow-sm"
  >
    <p class="pb-2 text-body font-medium">{{ count }} selected</p>
    <div class="w-40">
      <Select
        id="bulk-status"
        :model-value="status"
        label=""
        compact
        :options="statusOptions"
        @update:model-value="applyStatus"
      />
    </div>
    <div v-if="isAdmin" class="w-56">
      <UserPicker id="bulk-assign" model-value="" label="Assign to" @update:model-value="applyAssign" />
    </div>
    <Button variant="ghost" @click="emit('clear')">Clear</Button>
  </div>
</template>
