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
    class="relative h-6 w-11 shrink-0 rounded-full border motion-color disabled:cursor-not-allowed disabled:opacity-50"
    :class="modelValue ? 'border-primary bg-primary' : 'border-line bg-elevated'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow-sm motion-color"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
    />
  </button>
</template>
