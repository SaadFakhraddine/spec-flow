<script setup lang="ts">
import Button from './Button.vue'

withDefaults(defineProps<{ title: string; message: string; confirmLabel?: string }>(), { confirmLabel: 'Confirm' })
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-start justify-center bg-background/80 px-4 pt-24" role="dialog" aria-modal="true" :aria-label="title">
    <div class="w-full max-w-md border border-line bg-surface p-5">
      <h2 class="text-section font-medium">{{ title }}</h2>
      <p class="mt-2 text-body text-muted">{{ message }}</p>
      <div class="mt-5 flex justify-end gap-2">
        <Button variant="secondary" autofocus @click="emit('cancel')">Cancel</Button>
        <Button variant="danger" @click="emit('confirm')">{{ confirmLabel }}</Button>
      </div>
    </div>
  </div>
</template>
