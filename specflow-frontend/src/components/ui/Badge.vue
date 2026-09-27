<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span class="inline-flex border border-line bg-background px-2 py-0.5 font-mono text-label text-muted">{{ label }}</span>
</template>
