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
  <aside class="flex w-52 shrink-0 flex-col border-r border-line bg-surface/80 px-3 py-5 backdrop-blur">
    <div class="px-2">
      <p class="font-mono text-section font-semibold tracking-tight text-primary">SpecFlow</p>
      <p class="mt-0.5 text-label text-muted">Specs to shipping</p>
    </div>
    <nav class="mt-8 flex flex-col gap-0.5" aria-label="Primary">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-md border-l-2 px-2.5 py-2 text-body motion-color"
        :class="active(link.to)
          ? 'border-l-primary bg-elevated text-text'
          : 'border-l-transparent text-muted hover:bg-elevated/70 hover:text-text'"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="mt-auto border-t border-line pt-4">
      <p class="truncate px-2 text-body">{{ user?.name }}</p>
      <span class="sf-chip ml-2 mt-1 bg-elevated text-primary">{{ user?.role }}</span>
      <button
        type="button"
        class="mt-3 block px-2 text-body text-muted motion-color hover:text-primary"
        @click="signOut"
      >
        Log out
      </button>
    </div>
  </aside>
</template>
