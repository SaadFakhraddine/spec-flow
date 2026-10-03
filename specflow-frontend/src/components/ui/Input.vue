<script setup lang="ts">
defineProps<{ id: string; label: string; modelValue: string; type?: string; error?: string; placeholder?: string }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <label class="block" :for="id">
    <span v-if="label" class="mb-1 block text-label text-muted">{{ label }}</span>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full rounded-md border border-line bg-elevated px-3 py-2 text-body text-text motion-color placeholder:text-muted/60 focus:border-primary"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-1 block text-label text-danger">{{ error }}</span>
  </label>
</template>
