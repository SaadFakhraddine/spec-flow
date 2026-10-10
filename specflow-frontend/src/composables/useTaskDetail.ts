import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTasks } from '@/composables/useTasks'
import { useToast } from '@/composables/useToast'
import type { ChecklistItem, TaskInput, TaskStatus } from '@/types'
import { isSafeHttpUrl, safeHttpUrl } from '@/utils/url'
import { taskPriorities, taskStatusLabel, taskStatuses } from '@/utils/status'

export function useTaskDetail() {
  const route = useRoute()
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const {
    selectedTask,
    isLoading,
    error,
    fetchTaskById,
    updateTask,
    deleteTask,
    assignTask,
    watchTask,
    unwatchTask,
  } = useTasks()

  const editing = ref(false)
  const confirming = ref(false)
  const linkDraft = ref('')
  const draft = ref({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: '',
    externalUrl: '',
  })

  const statusOptions = taskStatuses.map((value) => ({ value, label: taskStatusLabel[value] }))
  const priorityOptions = taskPriorities.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const checklistReady = computed(() => selectedTask.value?.checklist.every((item) => item.done) ?? true)
  const safeExternalUrl = computed(() => safeHttpUrl(selectedTask.value?.externalUrl))

  function taskId(): string {
    return String(route.params.id)
  }

  async function load(): Promise<void> {
    await fetchTaskById(taskId())
    linkDraft.value = selectedTask.value?.externalUrl ?? ''
    editing.value = false
  }

  onMounted(() => {
    void load()
  })
  watch(
    () => route.params.id,
    () => {
      void load()
    },
  )

  async function saveLink(): Promise<void> {
    const trimmed = linkDraft.value.trim()
    if (trimmed && !isSafeHttpUrl(trimmed)) {
      toast.error('Link must be an http(s) URL')
      return
    }
    const updated = await updateTask(taskId(), { externalUrl: trimmed || null })
    if (updated) toast.success('Link saved')
    else toast.error(error.value || 'Could not save link')
  }

  async function onStatus(status: string): Promise<void> {
    const updated = await updateTask(taskId(), { status: status as TaskStatus })
    if (!updated) {
      toast.error(error.value || 'Could not update status')
      return
    }
    if (status === 'done' && !checklistReady.value) {
      toast.error('Marked done with an incomplete checklist')
    } else {
      toast.success('Status updated')
    }
  }

  function startEdit(): void {
    if (!selectedTask.value) return
    draft.value = {
      title: selectedTask.value.title,
      description: selectedTask.value.description,
      priority: selectedTask.value.priority,
      dueDate: selectedTask.value.dueDate ? selectedTask.value.dueDate.slice(0, 10) : '',
      tags: selectedTask.value.tags.join(', '),
      externalUrl: selectedTask.value.externalUrl,
    }
    editing.value = true
  }

  async function saveEdit(): Promise<void> {
    const external = draft.value.externalUrl.trim()
    if (external && !isSafeHttpUrl(external)) {
      toast.error('External link must be an http(s) URL')
      return
    }
    const input: Partial<TaskInput> = {
      title: draft.value.title,
      description: draft.value.description,
      priority: draft.value.priority as TaskInput['priority'],
      tags: draft.value.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      dueDate: draft.value.dueDate ? new Date(draft.value.dueDate).toISOString() : null,
      externalUrl: external || null,
    }
    const updated = await updateTask(taskId(), input)
    if (!updated) {
      toast.error(error.value || 'Could not save the task')
      return
    }
    editing.value = false
    toast.success('Task updated')
  }

  async function onAssign(userId: string): Promise<void> {
    if (!userId) return
    const updated = await assignTask(taskId(), userId)
    if (updated) toast.success('Task assigned')
    else toast.error(error.value || 'Could not assign the task')
  }

  async function onWatchToggle(): Promise<void> {
    const watching = selectedTask.value?.watching
    const updated = watching ? await unwatchTask(taskId()) : await watchTask(taskId())
    if (updated) toast.success(watching ? 'Unwatched' : 'Watching')
    else toast.error(error.value || 'Could not update watch')
  }

  async function onBlockers(payload: { blockedReason: string; blockedBy: string[] }): Promise<void> {
    const updated = await updateTask(taskId(), payload)
    if (updated) toast.success('Blockers updated')
    else toast.error(error.value || 'Could not update blockers')
  }

  async function onChecklist(items: ChecklistItem[]): Promise<void> {
    const updated = await updateTask(taskId(), { checklist: items })
    if (!updated) toast.error(error.value || 'Could not update checklist')
  }

  async function onDelete(): Promise<void> {
    const ok = await deleteTask(taskId())
    confirming.value = false
    if (!ok) {
      toast.error(error.value || 'Could not delete the task')
      return
    }
    toast.success('Task deleted')
    await router.push('/tasks')
  }

  return {
    selectedTask,
    isLoading,
    error,
    editing,
    confirming,
    linkDraft,
    draft,
    statusOptions,
    priorityOptions,
    isAdmin,
    checklistReady,
    safeExternalUrl,
    taskId,
    fetchTaskById,
    saveLink,
    onStatus,
    startEdit,
    saveEdit,
    onAssign,
    onWatchToggle,
    onBlockers,
    onChecklist,
    onDelete,
  }
}
