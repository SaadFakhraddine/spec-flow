<script setup lang="ts">
import Sidebar from './Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <Sidebar />
    <main class="min-w-0 flex-1">
      <slot />
    </main>
  </div>
</template>
