import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/composables/useApi'
import type { ApiResponse, Comment } from '@/types'
import { errorMessage } from '@/utils/errors'

export type CommentResource = 'tasks' | 'specs'

export const useCommentsStore = defineStore('comments', () => {
  const comments = ref<Comment[]>([])
  const isLoading = ref(false)
  const error = ref('')

  function path(resource: CommentResource, id: string): string {
    return `/${resource}/${id}/comments`
  }

  async function fetchComments(resource: CommentResource, id: string): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      const response = await apiClient.get<ApiResponse<Comment[]>>(path(resource, id))
      comments.value = response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
      comments.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createComment(
    resource: CommentResource,
    id: string,
    body: string,
  ): Promise<Comment | null> {
    error.value = ''
    try {
      const response = await apiClient.post<ApiResponse<Comment>>(path(resource, id), { body })
      comments.value = [...comments.value, response.data.data]
      return response.data.data
    } catch (caught) {
      error.value = errorMessage(caught)
      return null
    }
  }

  async function deleteComment(
    resource: CommentResource,
    id: string,
    commentId: string,
  ): Promise<boolean> {
    error.value = ''
    try {
      await apiClient.delete(`${path(resource, id)}/${commentId}`)
      comments.value = comments.value.filter((item) => item.id !== commentId)
      return true
    } catch (caught) {
      error.value = errorMessage(caught)
      return false
    }
  }

  function reset(): void {
    comments.value = []
    error.value = ''
  }

  return { comments, isLoading, error, fetchComments, createComment, deleteComment, reset }
})
