<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{ id: string; label: string; modelValue: string; error?: string; max?: number }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const area = ref<HTMLTextAreaElement | null>(null)

function resize(): void {
  const el = area.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  resize()
}

onMounted(resize)
watch(
  () => props.modelValue,
  async () => {
    await nextTick()
    resize()
  },
)
</script>

<template>
  <label class="block" :for="id">
    <span class="mb-1 flex items-center justify-between text-label text-muted">
      <span>{{ label }}</span>
      <span v-if="max" class="font-mono">{{ modelValue.length }} / {{ max }}</span>
    </span>
    <textarea
      :id="id"
      ref="area"
      :value="modelValue"
      :maxlength="max"
      rows="3"
      class="sf-control w-full resize-none overflow-hidden rounded-md border border-line bg-elevated text-body text-text motion-color focus:border-primary"
      @input="onInput"
    />
    <span v-if="error" class="mt-1 block text-label text-danger">{{ error }}</span>
  </label>
</template>
