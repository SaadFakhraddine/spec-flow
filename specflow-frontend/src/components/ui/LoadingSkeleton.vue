<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 })
</script>

<template>
  <div class="space-y-2" aria-hidden="true" aria-busy="true">
    <div v-for="row in rows" :key="row" class="skeleton h-10 bg-surface" />
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .skeleton {
    animation: pulse 1.4s ease-in-out infinite;
  }
}

@keyframes pulse {
  50% {
    opacity: 0.55;
  }
}
</style>
