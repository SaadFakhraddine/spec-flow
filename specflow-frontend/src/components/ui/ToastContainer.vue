<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2" aria-live="polite">
    <button
      v-for="toast in toasts"
      :key="toast.id"
      type="button"
      class="pointer-events-auto border border-line border-l-2 bg-surface px-3 py-2 text-left text-body"
      :class="toast.tone === 'success' ? 'border-l-success' : 'border-l-danger'"
      @click="dismiss(toast.id)"
    >
      {{ toast.message }}
    </button>
  </div>
</template>
