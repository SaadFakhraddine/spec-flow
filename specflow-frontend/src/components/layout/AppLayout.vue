<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'

const menuOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen">
    <Sidebar :open="menuOpen" @close="menuOpen = false" />
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex items-center gap-3 border-b border-line bg-surface/80 px-4 py-3 md:hidden">
        <button
          type="button"
          class="rounded-md border border-line px-2.5 py-1 text-body"
          aria-label="Open menu"
          aria-controls="app-sidebar"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          Menu
        </button>
        <p class="font-mono text-body font-semibold text-primary">SpecFlow</p>
      </header>
      <main class="min-w-0 flex-1 animate-sf-fade">
        <slot />
      </main>
    </div>
  </div>
</template>
