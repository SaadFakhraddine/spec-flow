<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppearance } from '@/composables/useAppearance'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import SearchPalette from '@/components/features/SearchPalette.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const route = useRoute()
const auth = useAuthStore()
const { hydrateFromUser } = useAppearance()

watch(
  () => auth.user?.preferences,
  () => {
    hydrateFromUser()
  },
  { immediate: true },
)
</script>

<template>
  <ToastContainer />
  <template v-if="auth.initialized">
    <SearchPalette v-if="!route.meta.blank" />
    <AppLayout v-if="!route.meta.blank">
      <RouterView />
    </AppLayout>
    <RouterView v-else />
  </template>
</template>
