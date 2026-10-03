<script setup lang="ts">
import MarkdownBody from '@/components/ui/MarkdownBody.vue'

defineProps<{ label: string; text?: string; items?: string[] }>()
</script>

<template>
  <section class="sf-panel border-l-2 border-l-primary/40 px-4 py-3">
    <h2 class="text-label uppercase tracking-wide text-muted">{{ label }}</h2>
    <MarkdownBody v-if="text" class="mt-2" :source="text" />
    <ul v-else class="mt-2 list-disc pl-5 text-body">
      <li v-for="(item, index) in items" :key="index">
        <MarkdownBody :source="item" />
      </li>
    </ul>
  </section>
</template>
