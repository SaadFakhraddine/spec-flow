import { storeToRefs } from 'pinia'
import { useCommentsStore } from '@/stores/comments'

export function useComments() {
  const store = useCommentsStore()
  return {
    ...storeToRefs(store),
    fetchComments: store.fetchComments,
    createComment: store.createComment,
    deleteComment: store.deleteComment,
    reset: store.reset,
  }
}
