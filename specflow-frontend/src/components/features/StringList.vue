<script setup lang="ts">
const props = defineProps<{ label: string; modelValue: string[]; error?: string }>()
const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

function update(index: number, value: string): void {
  const next = [...props.modelValue]
  next[index] = value
  emit('update:modelValue', next)
}

function add(): void {
  emit('update:modelValue', [...props.modelValue, ''])
}

function remove(index: number): void {
  const next = props.modelValue.filter((_, item) => item !== index)
  emit('update:modelValue', next.length > 0 ? next : [''])
}
</script>

<template>
  <fieldset>
    <legend class="mb-2 text-label text-muted">{{ label }}</legend>
    <div v-for="(item, index) in modelValue" :key="index" class="mb-2 flex gap-2">
      <input
        :value="item"
        class="w-full rounded-sm border border-line bg-background px-3 py-2 text-body"
        :aria-label="`${label} ${index + 1}`"
        @input="update(index, ($event.target as HTMLInputElement).value)"
      />
      <button type="button" class="text-body text-muted hover:text-text" @click="remove(index)">Remove</button>
    </div>
    <button type="button" class="text-body text-primary" @click="add">Add item</button>
    <p v-if="error" class="mt-1 text-label text-danger">{{ error }}</p>
  </fieldset>
</template>
