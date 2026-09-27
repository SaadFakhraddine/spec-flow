<script setup lang="ts">
import { computed } from 'vue'
import { pageWindow } from '@/utils/filters'
import Button from './Button.vue'

const props = defineProps<{ page: number; total: number; limit: number }>()
const emit = defineEmits<{ change: [number] }>()
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
const numbers = computed(() => pageWindow(props.page, totalPages.value))
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-4 flex items-center gap-2" aria-label="Pagination">
    <Button variant="ghost" :disabled="page <= 1" @click="emit('change', page - 1)">Previous</Button>
    <button
      v-for="number in numbers"
      :key="number"
      type="button"
      class="px-2 py-1 font-mono text-body motion-color"
      :class="number === page ? 'text-primary' : 'text-muted hover:text-text'"
      @click="emit('change', number)"
    >
      {{ number }}
    </button>
    <Button variant="ghost" :disabled="page >= totalPages" @click="emit('change', page + 1)">Next</Button>
  </nav>
</template>
