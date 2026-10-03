<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span class="sf-chip border border-line bg-elevated text-muted">{{ label }}</span>
</template>
