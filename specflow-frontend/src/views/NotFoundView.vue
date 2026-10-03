<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-6">
    <div class="sf-panel max-w-md animate-sf-fade p-8">
      <p class="font-mono text-body text-primary">404</p>
      <h1 class="mt-3 text-title font-semibold">This page does not exist</h1>
      <p class="mt-2 text-body text-muted">The address does not match a dashboard, task, or spec.</p>
      <RouterLink
        class="mt-6 inline-block text-body text-primary motion-color hover:brightness-110"
        :to="isAuthenticated ? '/dashboard' : '/login'"
      >
        {{ isAuthenticated ? 'Back to dashboard' : 'Back to sign in' }}
      </RouterLink>
    </div>
  </main>
</template>
