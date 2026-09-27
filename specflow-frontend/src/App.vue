<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const route = useRoute()
</script>

<template>
  <ToastContainer />
  <AppLayout v-if="!route.meta.blank">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>
