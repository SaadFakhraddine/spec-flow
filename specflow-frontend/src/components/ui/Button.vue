<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false, loading: false },
)

const styles = {
  primary: 'bg-primary text-background hover:bg-[#79b8ff]',
  secondary: 'border border-line bg-surface text-text hover:bg-line',
  danger: 'bg-danger text-white hover:bg-[#ff7b75]',
  ghost: 'bg-transparent text-muted hover:bg-surface hover:text-text',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-body font-medium motion-color disabled:cursor-not-allowed disabled:opacity-50"
    :class="styles[variant]"
  >
    <slot v-if="!loading" />
    <span v-else>Saving</span>
  </button>
</template>
