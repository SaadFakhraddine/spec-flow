<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useComments } from '@/composables/useComments'
import { useToast } from '@/composables/useToast'
import { formatRelative } from '@/utils/format'
import Button from '@/components/ui/Button.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import CommentForm from './CommentForm.vue'

const props = defineProps<{ taskId: string }>()
const { user } = useAuth()
const toast = useToast()
const { comments, isLoading, error, fetchComments, createComment, deleteComment, reset } = useComments()
const formRef = ref<{ clear: () => void } | null>(null)
const submitting = ref(false)

function canDelete(authorId: string): boolean {
  return user.value?.role === 'admin' || user.value?.id === authorId
}

onMounted(() => {
  void fetchComments(props.taskId)
})

watch(
  () => props.taskId,
  (id) => {
    reset()
    void fetchComments(id)
  },
)

async function onSubmit(body: string): Promise<void> {
  submitting.value = true
  const created = await createComment(props.taskId, body)
  submitting.value = false
  if (!created) {
    toast.error(error.value || 'Could not post comment')
    return
  }
  formRef.value?.clear()
  toast.success('Comment added')
}

async function onDelete(commentId: string): Promise<void> {
  const ok = await deleteComment(props.taskId, commentId)
  if (ok) toast.success('Comment deleted')
  else toast.error(error.value || 'Could not delete comment')
}
</script>

<template>
  <section class="sf-panel flex flex-col gap-4 p-4">
    <h2 class="text-section font-medium">Comments</h2>
    <LoadingSkeleton v-if="isLoading && comments.length === 0" :rows="2" />
    <p v-else-if="error && comments.length === 0" class="text-body text-danger">{{ error }}</p>
    <p v-else-if="comments.length === 0" class="text-body text-muted">No comments yet.</p>
    <ul v-else class="space-y-3">
      <li v-for="comment in comments" :key="comment.id" class="border-b border-line pb-3 last:border-b-0">
        <div class="flex items-baseline gap-2">
          <span class="text-body font-medium">{{ comment.author.name }}</span>
          <span class="font-mono text-label text-muted">{{ formatRelative(comment.createdAt) }}</span>
          <Button
            v-if="canDelete(comment.author.id)"
            class="ml-auto"
            variant="ghost"
            @click="onDelete(comment.id)"
          >
            Delete
          </Button>
        </div>
        <p class="mt-1 whitespace-pre-wrap text-body">{{ comment.body }}</p>
      </li>
    </ul>
    <CommentForm ref="formRef" :submitting="submitting" @submit="onSubmit" />
  </section>
</template>
