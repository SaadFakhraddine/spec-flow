<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const sections = [
  { id: 'appearance', label: 'Appearance', hint: 'Theme and density' },
  { id: 'profile', label: 'Profile', hint: 'Your work identity' },
  { id: 'notifications', label: 'Notifications', hint: 'What alerts you get' },
  { id: 'defaults', label: 'Defaults', hint: 'Landing, view, and scope' },
] as const

const active = computed(() => String(route.params.section || 'appearance'))
</script>

<template>
  <nav class="sf-panel sf-panel-pad space-y-1" aria-label="Settings sections">
    <RouterLink
      v-for="section in sections"
      :key="section.id"
      :to="`/settings/${section.id}`"
      class="block rounded-md px-3 py-2 motion-color"
      :class="
        active === section.id
          ? 'bg-elevated text-text'
          : 'text-muted hover:bg-elevated/70 hover:text-text'
      "
    >
      <span class="block text-body font-medium">{{ section.label }}</span>
      <span class="block text-label text-muted">{{ section.hint }}</span>
    </RouterLink>
  </nav>
</template>
