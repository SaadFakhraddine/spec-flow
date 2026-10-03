<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'

const emit = defineEmits<{ submit: [string] }>()
const props = defineProps<{ submitting?: boolean }>()
const body = ref('')

function send(): void {
  const text = body.value.trim()
  if (!text || props.submitting) return
  emit('submit', text)
}

function clear(): void {
  body.value = ''
}

defineExpose({ clear })
</script>

<template>
  <form class="flex flex-col gap-2" @submit.prevent="send">
    <Textarea id="comment-body" v-model="body" label="Add a comment" :max="2000" />
    <div class="flex justify-end">
      <Button type="submit" :loading="submitting" :disabled="!body.trim()">Comment</Button>
    </div>
  </form>
</template>
