<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ taskCount: number; tasksDone: number }>()

const label = computed(() => {
  if (props.taskCount <= 0) return '—'
  return `${props.tasksDone}/${props.taskCount}`
})
</script>

<template>
  <span class="font-mono text-label text-muted" :title="taskCount ? 'Linked tasks done' : 'No linked tasks'">
    {{ label }}
  </span>
</template>
