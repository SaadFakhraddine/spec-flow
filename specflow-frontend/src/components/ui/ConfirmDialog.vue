<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import Button from './Button.vue'

withDefaults(defineProps<{ title: string; message: string; confirmLabel?: string }>(), {
  confirmLabel: 'Confirm',
})
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const panel = ref<HTMLElement | null>(null)
useFocusTrap(panel, { onEscape: () => emit('cancel') })
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-start justify-center bg-background/80 px-4 pt-24"
    role="presentation"
    @click.self="emit('cancel')"
  >
    <div
      ref="panel"
      class="w-full max-w-md rounded-md border border-line bg-surface p-5 shadow-panel"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <h2 class="text-section font-medium">{{ title }}</h2>
      <p class="mt-2 text-body text-muted">{{ message }}</p>
      <div class="mt-5 flex justify-end gap-2">
        <Button variant="secondary" @click="emit('cancel')">Cancel</Button>
        <Button variant="danger" @click="emit('confirm')">{{ confirmLabel }}</Button>
      </div>
    </div>
  </div>
</template>
