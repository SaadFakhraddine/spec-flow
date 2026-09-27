<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <main class="min-h-screen bg-background px-8 py-16">
    <p class="font-mono text-body text-primary">404</p>
    <h1 class="mt-4 text-title font-semibold">This page does not exist</h1>
    <p class="mt-2 text-body text-muted">The address does not match a dashboard, task, or spec.</p>
    <RouterLink class="mt-6 inline-block text-body text-primary" :to="isAuthenticated ? '/dashboard' : '/login'">
      {{ isAuthenticated ? 'Back to dashboard' : 'Back to sign in' }}
    </RouterLink>
  </main>
</template>
