<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <section class="px-6 py-5 lg:px-8">
    <header class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
      <div>
        <h1 class="text-title font-semibold tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-body text-muted">{{ subtitle }}</p>
        <slot name="subtitle" />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>
