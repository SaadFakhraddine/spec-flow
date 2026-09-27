<script setup lang="ts">
defineProps<{ label: string; text?: string; items?: string[] }>()
</script>

<template>
  <section class="border-l-2 border-l-line bg-surface/60 px-4 py-3">
    <h2 class="text-label text-muted">{{ label }}</h2>
    <p v-if="text" class="mt-2 whitespace-pre-wrap text-body">{{ text }}</p>
    <ul v-else class="mt-2 list-disc pl-5 text-body">
      <li v-for="(item, index) in items" :key="index">{{ item }}</li>
    </ul>
  </section>
</template>
