<script setup lang="ts">
defineProps<{ title: string; message: string }>()
</script>

<template>
  <div class="sf-panel px-5 py-8">
    <h2 class="text-section font-medium">{{ title }}</h2>
    <p class="mt-2 max-w-lg text-body text-muted">{{ message }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
