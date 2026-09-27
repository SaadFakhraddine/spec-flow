<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="px-8 py-6">
    <header class="mb-6 flex items-end justify-between gap-4">
      <h1 class="text-title font-semibold tracking-tight">{{ title }}</h1>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>
