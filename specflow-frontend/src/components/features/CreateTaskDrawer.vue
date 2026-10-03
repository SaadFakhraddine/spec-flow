<script setup lang="ts">
import { ref } from 'vue'
import type { TaskInput } from '@/types'
import CreateTaskForm from './CreateTaskForm.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{
  submit: [TaskInput]
  cancel: []
}>()

const formRef = ref<{ stopSaving: () => void } | null>(null)

function stopSaving(): void {
  formRef.value?.stopSaving()
}

defineExpose({ stopSaving })
</script>

<template>
  <Transition name="drawer">
    <aside
      v-if="open"
      class="fixed inset-y-0 right-0 z-30 w-full max-w-md overflow-auto border-l border-line bg-surface p-6 shadow-panel"
    >
      <h2 class="mb-4 text-section font-medium">New task</h2>
      <CreateTaskForm ref="formRef" @submit="emit('submit', $event)" @cancel="emit('cancel')" />
    </aside>
  </Transition>
</template>
