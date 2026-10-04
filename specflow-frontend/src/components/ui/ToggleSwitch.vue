<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
  disabled?: boolean
}>()

defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    class="relative h-4 w-7 shrink-0 rounded-full border motion-color disabled:cursor-not-allowed disabled:opacity-50"
    :class="modelValue ? 'border-primary bg-primary' : 'border-line bg-elevated'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-px left-px h-3 w-3 rounded-full bg-background shadow-sm motion-color"
      :class="modelValue ? 'translate-x-3' : 'translate-x-0'"
    />
  </button>
</template>
