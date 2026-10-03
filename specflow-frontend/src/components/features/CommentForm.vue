<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { UserRef } from '@/types'
import { useMentionable } from '@/composables/useMentionable'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'

const emit = defineEmits<{ submit: [string] }>()
const props = defineProps<{ submitting?: boolean }>()
const body = ref('')
const { users, load } = useMentionable()

onMounted(() => {
  void load()
})

const hint = computed(() => {
  const match = body.value.match(/(?:^|\s)@([a-zA-Z0-9._-]*)$/)
  if (!match) return [] as UserRef[]
  const q = (match[1] ?? '').toLowerCase()
  return users.value
    .filter((user) => {
      const local = user.email.split('@')[0]?.toLowerCase() ?? ''
      const name = user.name.toLowerCase().replace(/\s+/g, '')
      return !q || local.startsWith(q) || name.startsWith(q) || user.name.toLowerCase().startsWith(q)
    })
    .slice(0, 5)
})

function insertMention(user: UserRef): void {
  const local = user.email.split('@')[0] ?? user.name.replace(/\s+/g, '')
  body.value = body.value.replace(/(?:^|\s)@([a-zA-Z0-9._-]*)$/, (chunk) => {
    const prefix = chunk.startsWith('@') ? '' : chunk[0] ?? ''
    return `${prefix}@${local} `
  })
}

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
  <form class="relative flex flex-col gap-2" @submit.prevent="send">
    <Textarea id="comment-body" v-model="body" label="Add a comment" :max="2000" />
    <ul
      v-if="hint.length"
      class="absolute bottom-14 left-0 z-10 w-64 rounded-md border border-line bg-surface py-1 shadow-sm"
    >
      <li v-for="person in hint" :key="person.id">
        <button
          type="button"
          class="flex w-full px-3 py-1.5 text-left text-body hover:bg-elevated"
          @click="insertMention(person)"
        >
          <span class="font-medium">{{ person.name }}</span>
          <span class="ml-2 text-muted">@{{ person.email.split('@')[0] }}</span>
        </button>
      </li>
    </ul>
    <div class="flex justify-end">
      <Button type="submit" :loading="submitting" :disabled="!body.trim()">Comment</Button>
    </div>
  </form>
</template>
