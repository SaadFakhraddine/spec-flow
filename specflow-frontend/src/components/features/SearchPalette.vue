<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { useSearch, type SearchHit } from '@/composables/useSearch'
const open = ref(false)
const query = ref('')
const selected = ref(0)
const panel = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const router = useRouter()
const { tasks, specs, isLoading, search } = useSearch()
useFocusTrap(panel, { active: open, onEscape: () => { open.value = false } })

watch(open, (value) => {
  if (value) {
    query.value = ''
    void Promise.resolve().then(() => input.value?.focus())
  }
})

const results = computed(() => [...tasks.value, ...specs.value])

watch(query, (value) => {
  selected.value = 0
  void search(value)
})

function onHotkey(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = true
  }
}

function move(delta: number): void {
  if (results.value.length === 0) return
  selected.value = (selected.value + delta + results.value.length) % results.value.length
}

async function go(hit?: SearchHit): Promise<void> {
  const target = hit ?? results.value[selected.value]
  if (!target) return
  open.value = false
  query.value = ''
  await router.push(target.kind === 'task' ? `/tasks/${target.id}` : `/specs/${target.id}`)
}

onMounted(() => document.addEventListener('keydown', onHotkey))
onBeforeUnmount(() => document.removeEventListener('keydown', onHotkey))
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-start justify-center bg-background/70 px-4 pt-24"
    role="presentation"
    @click.self="open = false"
  >
    <div
      ref="panel"
      class="w-full max-w-lg rounded-md border border-line bg-surface p-4 shadow-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <label class="block" for="global-search">
        <span class="mb-1 block text-label text-muted">Search tasks and specs</span>
        <input
          id="global-search"
          ref="input"
          v-model="query"
          class="w-full rounded-md border border-line bg-elevated px-3 py-2 text-body"
          placeholder="Type a title…"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="go()"
        />
      </label>
      <p v-if="isLoading" class="mt-3 text-body text-muted">Searching…</p>
      <ul v-else class="mt-3 max-h-72 space-y-1 overflow-auto">
        <li v-if="query && results.length === 0" class="px-2 py-2 text-body text-muted">No matches.</li>
        <li v-for="(hit, index) in results" :key="`${hit.kind}-${hit.id}`">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body"
            :class="index === selected ? 'bg-elevated text-primary' : 'hover:bg-elevated'"
            @mouseenter="selected = index"
            @click="go(hit)"
          >
            <span class="sf-chip bg-background text-muted">{{ hit.kind }}</span>
            <span class="truncate">{{ hit.title }}</span>
          </button>
        </li>
      </ul>
      <p class="mt-3 text-label text-muted">Ctrl/Cmd+K opens search · Esc closes</p>
    </div>
  </div>
</template>
