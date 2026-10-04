<script setup lang="ts">
defineProps<{
  id: string
  label: string
  modelValue: string
  options: { value: string; label: string }[]
  error?: string
  compact?: boolean
}>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <label class="block" :for="id">
    <span v-if="label" class="mb-1 block text-label text-muted">{{ label }}</span>
    <select
      :id="id"
      :value="modelValue"
      class="w-full rounded-md border border-line bg-elevated text-body text-text motion-color focus:border-primary"
      :class="compact ? 'px-2 py-1 text-label' : 'sf-control'"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <span v-if="error" class="mt-1 block text-label text-danger">{{ error }}</span>
  </label>
</template>
