<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, User } from '@/types'
import { errorMessage } from '@/utils/errors'

const props = defineProps<{
  id: string
  label: string
  modelValue: string
  placeholder?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const query = ref('')
const open = ref(false)
const loading = ref(false)
const error = ref('')
const users = ref<User[]>([])
const root = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const match = users.value.find((user) => user.id === props.modelValue)
  return match ? `${match.name} · ${match.email}` : props.modelValue ? 'Selected user' : ''
})

async function search(term = query.value): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', {
      params: { q: term || undefined, limit: 20 },
    })
    users.value = response.data.data
  } catch (caught) {
    error.value = errorMessage(caught)
    users.value = []
  } finally {
    loading.value = false
  }
}

function pick(user: User): void {
  emit('update:modelValue', user.id)
  query.value = ''
  open.value = false
}

function clear(): void {
  emit('update:modelValue', '')
  query.value = ''
}

function onDocClick(event: MouseEvent): void {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (value) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    if (open.value) void search(value)
  }, 200)
})

onMounted(() => {
  document.addEventListener('click', onDocClick)
  void search('')
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div ref="root" class="relative">
    <label class="block" :for="id">
      <span class="mb-1 block text-label text-muted">{{ label }}</span>
      <input
        :id="id"
        v-model="query"
        type="search"
        class="w-full rounded-md border border-line bg-elevated px-3 py-2 text-body text-text"
        :placeholder="placeholder ?? 'Search people…'"
        autocomplete="off"
        @focus="open = true; search(query)"
      />
    </label>
    <p v-if="modelValue && !open" class="mt-1 text-label text-muted">
      {{ selectedLabel }}
      <button type="button" class="ml-2 text-primary" @click="clear">Clear</button>
    </p>
    <ul
      v-if="open"
      class="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-md border border-line bg-surface py-1 shadow-panel"
    >
      <li v-if="loading" class="px-3 py-2 text-label text-muted">Searching…</li>
      <li v-else-if="error" class="px-3 py-2 text-label text-danger">{{ error }}</li>
      <li v-else-if="users.length === 0" class="px-3 py-2 text-label text-muted">No people found</li>
      <li v-for="person in users" :key="person.id">
        <button
          type="button"
          class="flex w-full flex-col px-3 py-1.5 text-left hover:bg-elevated"
          @click="pick(person)"
        >
          <span class="text-body font-medium">{{ person.name }}</span>
          <span class="text-label text-muted">{{ person.email }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
