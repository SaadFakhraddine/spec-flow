<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { TaskFilters } from '@/types'
import { useSavedFilters } from '@/composables/useSavedFilters'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ filters: TaskFilters }>()
const emit = defineEmits<{ apply: [TaskFilters] }>()
const toast = useToast()
const { items, error, load, save, remove } = useSavedFilters()
const naming = ref(false)
const name = ref('')

const canSave = computed(() =>
  Boolean(
    props.filters.status ||
      props.filters.priority ||
      props.filters.assignedTo ||
      props.filters.q ||
      props.filters.due ||
      props.filters.blocked,
  ),
)

onMounted(() => {
  void load()
})

watch(canSave, (ok) => {
  if (!ok && naming.value) cancelNaming()
})

async function onSave(): Promise<void> {
  const trimmed = name.value.trim()
  if (!trimmed || !canSave.value) return
  const created = await save(trimmed, props.filters)
  if (!created) {
    toast.error(error.value || 'Could not save filter')
    return
  }
  naming.value = false
  name.value = ''
  toast.success('Filter saved')
}

async function onRemove(id: string): Promise<void> {
  const ok = await remove(id)
  if (ok) toast.success('Filter removed')
  else toast.error(error.value || 'Could not remove filter')
}

function cancelNaming(): void {
  naming.value = false
  name.value = ''
}
</script>

<template>
  <div class="mb-2 flex flex-wrap items-center gap-2">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="sf-toolbar-control group inline-flex items-center gap-1 rounded-md border border-line bg-elevated text-label motion-color hover:border-primary"
      @click="emit('apply', { ...item.query })"
    >
      {{ item.name }}
      <span
        class="ml-1 text-muted opacity-60 group-hover:opacity-100"
        role="button"
        tabindex="0"
        aria-label="Remove saved filter"
        @click.stop="onRemove(item.id)"
        @keydown.enter.stop="onRemove(item.id)"
      >
        ×
      </span>
    </button>

    <button
      v-if="canSave && !naming"
      type="button"
      class="sf-toolbar-control inline-flex items-center gap-1 rounded-md border border-dashed border-line text-label text-muted motion-color hover:border-primary/50 hover:text-text"
      @click="naming = true"
    >
      <span aria-hidden="true">+</span>
      Save view
    </button>

    <template v-else-if="naming">
      <input
        id="saved-filter-name"
        v-model="name"
        type="text"
        aria-label="Filter name"
        placeholder="Name this view"
        class="sf-toolbar-control w-44 rounded-md border border-line bg-elevated text-body text-text motion-color placeholder:text-muted/60 focus:border-primary focus:outline-none"
        @keydown.enter.prevent="onSave"
        @keydown.escape.prevent="cancelNaming"
      />
      <button
        type="button"
        class="sf-toolbar-control inline-flex items-center rounded-md bg-primary text-body font-medium text-background motion-color hover:brightness-110"
        @click="onSave"
      >
        Save
      </button>
      <button
        type="button"
        class="sf-toolbar-control inline-flex items-center rounded-md text-label text-muted motion-color hover:bg-elevated hover:text-text"
        @click="cancelNaming"
      >
        Cancel
      </button>
    </template>
  </div>
</template>
