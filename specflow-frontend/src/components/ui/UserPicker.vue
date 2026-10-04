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
const selected = ref<User | null>(null)
const root = ref<HTMLElement | null>(null)

const inputValue = computed({
  get: () => {
    if (open.value) return query.value
    return selected.value?.name ?? ''
  },
  set: (value: string) => {
    query.value = value
  },
})

const hint = computed(() => {
  if (open.value) return props.placeholder ?? 'Search people…'
  if (selected.value) return selected.value.email
  return props.placeholder ?? 'Search people…'
})

async function search(term = query.value): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', {
      params: { q: term || undefined, limit: 20 },
    })
    users.value = response.data.data
    if (props.modelValue && !selected.value) {
      selected.value = users.value.find((user) => user.id === props.modelValue) ?? null
    }
  } catch (caught) {
    error.value = errorMessage(caught)
    users.value = []
  } finally {
    loading.value = false
  }
}

function pick(user: User): void {
  selected.value = user
  emit('update:modelValue', user.id)
  query.value = ''
  open.value = false
}

function clear(): void {
  selected.value = null
  emit('update:modelValue', '')
  query.value = ''
}

function onFocus(): void {
  open.value = true
  query.value = ''
  void search('')
}

function onDocClick(event: MouseEvent): void {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (value) => {
  if (!open.value) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    void search(value)
  }, 200)
})

watch(
  () => props.modelValue,
  async (id) => {
    if (!id) {
      selected.value = null
      return
    }
    if (selected.value?.id === id) return
    const match = users.value.find((user) => user.id === id)
    if (match) {
      selected.value = match
      return
    }
    await search('')
    selected.value = users.value.find((user) => user.id === id) ?? selected.value
  },
)

onMounted(() => {
  document.addEventListener('click', onDocClick)
  void search('').then(() => {
    if (props.modelValue) {
      selected.value = users.value.find((user) => user.id === props.modelValue) ?? null
    }
  })
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
      <div class="flex gap-1">
        <input
          :id="id"
          v-model="inputValue"
          type="search"
          class="w-full rounded-md border border-line bg-elevated px-3 py-2 text-body text-text"
          :placeholder="hint"
          autocomplete="off"
          @focus="onFocus"
        />
        <button
          v-if="modelValue"
          type="button"
          class="shrink-0 rounded-md border border-line px-2 text-label text-muted hover:bg-elevated"
          aria-label="Clear assignee"
          @click="clear"
        >
          ×
        </button>
      </div>
    </label>
    <ul
      v-if="open"
      class="absolute left-0 right-0 z-40 mt-1 max-h-56 overflow-auto rounded-md border border-line bg-surface py-1 shadow-panel"
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
