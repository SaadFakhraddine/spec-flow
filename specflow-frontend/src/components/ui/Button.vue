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
  primary: 'bg-primary text-background hover:brightness-110',
  secondary: 'border border-line bg-elevated text-text hover:border-primary/40',
  danger: 'bg-danger text-background hover:brightness-110',
  ghost: 'bg-transparent text-muted hover:bg-elevated hover:text-text',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="sf-btn inline-flex items-center justify-center rounded-md text-body font-medium motion-color disabled:cursor-not-allowed disabled:opacity-50"
    :class="styles[variant]"
  >
    <slot v-if="!loading" />
    <span v-else>Saving</span>
  </button>
</template>
