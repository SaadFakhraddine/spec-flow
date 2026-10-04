<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NotificationBell from '@/components/features/NotificationBell.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth()

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/specs', label: 'Specs' },
  { to: '/settings', label: 'Settings' },
]

function active(path: string): boolean {
  if (path === '/dashboard') return route.path === '/dashboard'
  if (path === '/settings') return route.path.startsWith('/settings')
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function signOut(): Promise<void> {
  await logout()
  emit('close')
  await router.push('/login')
}

watch(
  () => route.fullPath,
  () => emit('close'),
)
</script>

<template>
  <div
    class="fixed inset-0 z-40 bg-background/70 md:hidden"
    :class="open ? 'block' : 'hidden'"
    aria-hidden="true"
    @click="emit('close')"
  />
  <aside
    id="app-sidebar"
    class="sf-sidebar fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col overflow-visible border-r border-line bg-surface shadow-panel motion-color md:static md:z-30 md:translate-x-0 md:shadow-none"
    :class="open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <div class="flex items-start justify-between gap-2 px-2">
      <div>
        <p class="font-mono text-section font-semibold tracking-tight text-primary">SpecFlow</p>
        <p class="mt-0.5 text-label text-muted">Specs to shipping</p>
      </div>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-body text-muted md:hidden"
        aria-label="Close menu"
        @click="emit('close')"
      >
        Close
      </button>
    </div>
    <nav class="mt-6 flex flex-col gap-0.5 md:mt-8" aria-label="Primary">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="sf-nav-link rounded-md border-l-2 px-2.5 text-body motion-color"
        :class="active(link.to)
          ? 'border-l-primary bg-elevated text-text'
          : 'border-l-transparent text-muted hover:bg-elevated/70 hover:text-text'"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="mt-auto border-t border-line pt-4">
      <NotificationBell />
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
