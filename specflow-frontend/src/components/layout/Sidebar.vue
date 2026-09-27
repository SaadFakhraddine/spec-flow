<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth()

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/specs', label: 'Specs' },
]

function active(path: string): boolean {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function signOut(): Promise<void> {
  await logout()
  await router.push('/login')
}
</script>

<template>
  <aside class="flex w-56 shrink-0 flex-col border-r border-line bg-background px-4 py-6">
    <p class="px-2 font-mono text-body text-primary">SpecFlow</p>
    <nav class="mt-8 flex flex-col gap-1" aria-label="Primary">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="border-l-2 px-2 py-2 text-body motion-color"
        :class="active(link.to) ? 'border-l-primary bg-surface text-text' : 'border-l-transparent text-muted hover:bg-surface hover:text-text'"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="mt-auto border-t border-line pt-4">
      <p class="px-2 text-body">{{ user?.name }}</p>
      <p class="px-2 text-label capitalize text-muted">{{ user?.role }}</p>
      <button type="button" class="mt-3 px-2 text-body text-muted motion-color hover:text-text" @click="signOut">Log out</button>
    </div>
  </aside>
</template>
