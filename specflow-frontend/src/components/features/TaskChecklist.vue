<script setup lang="ts">
import type { ChecklistItem } from '@/types'

const props = defineProps<{ items: ChecklistItem[] }>()
const emit = defineEmits<{ change: [ChecklistItem[]] }>()

function toggle(key: string, done: boolean): void {
  emit(
    'change',
    props.items.map((item) => (item.key === key ? { ...item, done } : item)),
  )
}
</script>

<template>
  <section class="sf-panel space-y-3 p-4">
    <h2 class="text-section font-medium">Done checklist</h2>
    <ul class="space-y-2">
      <li v-for="item in items" :key="item.key" class="flex items-center gap-2 text-body">
        <input
          :id="`check-${item.key}`"
          type="checkbox"
          class="sf-check"
          :checked="item.done"
          @change="toggle(item.key, ($event.target as HTMLInputElement).checked)"
        />
        <label :for="`check-${item.key}`">{{ item.label }}</label>
      </li>
    </ul>
  </section>
</template>
