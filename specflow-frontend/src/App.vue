<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import SearchPalette from '@/components/features/SearchPalette.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const route = useRoute()
</script>

<template>
  <ToastContainer />
  <SearchPalette v-if="!route.meta.blank" />
  <AppLayout v-if="!route.meta.blank">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>
