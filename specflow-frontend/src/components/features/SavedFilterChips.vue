<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TaskFilters } from '@/types'
import { useSavedFilters } from '@/composables/useSavedFilters'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const props = defineProps<{ filters: TaskFilters }>()
const emit = defineEmits<{ apply: [TaskFilters] }>()
const toast = useToast()
const { items, error, load, save, remove } = useSavedFilters()
const naming = ref(false)
const name = ref('')

onMounted(() => {
  void load()
})

async function onSave(): Promise<void> {
  const trimmed = name.value.trim()
  if (!trimmed) return
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
</script>

<template>
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="group inline-flex items-center gap-1 rounded-md border border-line bg-elevated px-2.5 py-1 text-label motion-color hover:border-primary"
      @click="emit('apply', { ...item.query })"
    >
      {{ item.name }}
      <span
        class="ml-1 text-muted opacity-0 group-hover:opacity-100"
        role="button"
        tabindex="0"
        aria-label="Remove saved filter"
        @click.stop="onRemove(item.id)"
        @keydown.enter.stop="onRemove(item.id)"
      >
        ×
      </span>
    </button>
    <Button v-if="!naming" variant="ghost" @click="naming = true">Save filter</Button>
    <div v-else class="flex items-end gap-2">
      <div class="w-40">
        <Input id="saved-filter-name" v-model="name" label="Name" placeholder="My view" />
      </div>
      <Button @click="onSave">Save</Button>
      <Button variant="ghost" @click="naming = false">Cancel</Button>
    </div>
  </div>
</template>
