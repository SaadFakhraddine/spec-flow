<script setup lang="ts">
defineProps<{ id: string; label: string; modelValue: string; type?: string; error?: string }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <label class="block" :for="id">
    <span class="mb-1 block text-label text-muted">{{ label }}</span>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      class="w-full rounded-sm border border-line bg-background px-3 py-2 text-body text-text motion-color focus:border-primary"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-1 block text-label text-danger">{{ error }}</span>
  </label>
</template>
