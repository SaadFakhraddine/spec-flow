<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TaskInput, TaskPriority, TaskStatus } from '@/types'
import { taskPriorities, taskStatuses, taskStatusLabel } from '@/utils/status'
import { fieldErrors, taskSchema } from '@/utils/validators'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'

const emit = defineEmits<{ submit: [TaskInput]; cancel: [] }>()
const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('medium')
const status = ref<TaskStatus>('backlog')
const dueDate = ref('')
const tagsText = ref('')
const errors = ref<Record<string, string>>({})
const saving = ref(false)

const priorityOptions = taskPriorities.map((value) => ({ value, label: value[0]?.toUpperCase() + value.slice(1) }))
const statusOptions = computed(() => taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] })))

function clearError(field: string): void {
  errors.value = { ...errors.value, [field]: '' }
}

function payload(): TaskInput {
  const tags = tagsText.value.split(',').map((tag) => tag.trim()).filter(Boolean)
  return {
    title: title.value,
    description: description.value,
    priority: priority.value,
    status: status.value,
    tags,
    dueDate: dueDate.value ? new Date(dueDate.value).toISOString() : null,
  }
}

async function onSubmit(): Promise<void> {
  const tags = tagsText.value.split(',').map((tag) => tag.trim()).filter(Boolean)
  const nextErrors = fieldErrors(taskSchema, { ...payload(), tags, dueDate: dueDate.value })
  errors.value = nextErrors
  if (Object.values(nextErrors).some(Boolean)) return
  saving.value = true
  emit('submit', payload())
}

function stopSaving(): void {
  saving.value = false
}

defineExpose({ stopSaving })
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <Input id="task-title" v-model="title" label="Title" :error="errors.title" @update:model-value="clearError('title')" />
    <Textarea id="task-description" v-model="description" label="Description" :max="500" :error="errors.description" @update:model-value="clearError('description')" />
    <Select id="task-priority" v-model="priority" label="Priority" :options="priorityOptions" />
    <Select id="task-status" v-model="status" label="Status" :options="statusOptions" />
    <Input id="task-due" v-model="dueDate" label="Due date" type="date" />
    <Input id="task-tags" v-model="tagsText" label="Tags" :error="errors.tags" @update:model-value="clearError('tags')" />
    <p class="text-label text-muted">Separate tags with commas. Five tags at most.</p>
    <div class="flex justify-end gap-2">
      <Button variant="ghost" type="button" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" :loading="saving">Create task</Button>
    </div>
  </form>
</template>
