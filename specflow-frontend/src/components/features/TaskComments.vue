<script setup lang="ts">
import CommentsPanel from './CommentsPanel.vue'

defineProps<{ taskId: string }>()
</script>

<template>
  <CommentsPanel resource="tasks" :parent-id="taskId" />
</template>
