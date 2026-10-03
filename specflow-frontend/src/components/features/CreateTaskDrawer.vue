<script setup lang="ts">
import { ref, toRef } from 'vue'
import type { TaskInput } from '@/types'
import { useFocusTrap } from '@/composables/useFocusTrap'
import CreateTaskForm from './CreateTaskForm.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  submit: [TaskInput]
  cancel: []
}>()

const formRef = ref<{ stopSaving: () => void } | null>(null)
const panel = ref<HTMLElement | null>(null)
useFocusTrap(panel, { active: toRef(props, 'open'), onEscape: () => emit('cancel') })

function stopSaving(): void {
  formRef.value?.stopSaving()
}

defineExpose({ stopSaving })
</script>

<template>
  <Transition name="drawer">
    <div v-if="open" class="fixed inset-0 z-30" role="presentation">
      <div class="absolute inset-0 bg-background/60" @click="emit('cancel')" />
      <aside
        ref="panel"
        class="absolute inset-y-0 right-0 w-full max-w-md overflow-auto border-l border-line bg-surface p-6 shadow-panel"
        role="dialog"
        aria-modal="true"
        aria-label="New task"
      >
        <h2 class="mb-4 text-section font-medium">New task</h2>
        <CreateTaskForm ref="formRef" @submit="emit('submit', $event)" @cancel="emit('cancel')" />
      </aside>
    </div>
  </Transition>
</template>
