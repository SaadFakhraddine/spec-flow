import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSpecs } from '@/composables/useSpecs'
import { useTasks } from '@/composables/useTasks'
import { useToast } from '@/composables/useToast'
import type { SpecForm, SpecStatus } from '@/types'
import { allowedSpecStatuses } from '@/utils/specTransitions'
import { specStatusLabel } from '@/utils/status'
import { fieldErrors, specSchema } from '@/utils/validators'

export function useSpecDetail() {
  const route = useRoute()
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const {
    selectedSpec,
    revisions,
    isLoading,
    error,
    fetchSpecById,
    fetchRevisions,
    updateSpec,
    archiveSpec,
    unarchiveSpec,
    deleteSpec,
    addTaskToSpec,
    unlinkTaskFromSpec,
  } = useSpecs()
  const { createTask, error: taskError } = useTasks()

  const editing = ref(false)
  const linking = ref(false)
  const creatingTask = ref(false)
  const newTaskTitle = ref('')
  const confirmDelete = ref(false)
  const unlinkTaskId = ref<string | null>(null)
  const draft = ref<SpecForm | null>(null)
  const errors = ref<Record<string, string>>({})
  const isAdmin = computed(() => user.value?.role === 'admin')
  const statusOptions = computed(() => {
    const current = selectedSpec.value?.status
    if (!current) return []
    return allowedSpecStatuses(current).map((value) => ({ value, label: specStatusLabel[value] }))
  })

  function specId(): string {
    return String(route.params.id)
  }

  async function load(): Promise<void> {
    const id = specId()
    await Promise.all([fetchSpecById(id), fetchRevisions(id)])
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

  function startEdit(): void {
    if (!selectedSpec.value) return
    draft.value = {
      title: selectedSpec.value.title,
      businessGoal: selectedSpec.value.businessGoal,
      technicalApproach: selectedSpec.value.technicalApproach,
      apiDesign: selectedSpec.value.apiDesign,
      edgeCases: selectedSpec.value.edgeCases.length ? selectedSpec.value.edgeCases : [''],
      acceptanceCriteria: selectedSpec.value.acceptanceCriteria,
      regressionRisks: selectedSpec.value.regressionRisks,
      status: selectedSpec.value.status,
    }
    editing.value = true
  }

  async function save(): Promise<void> {
    if (!draft.value) return
    const filled = {
      ...draft.value,
      edgeCases: draft.value.edgeCases.map((item) => item.trim()).filter(Boolean),
      acceptanceCriteria: draft.value.acceptanceCriteria.map((item) => item.trim()).filter(Boolean),
    }
    errors.value = fieldErrors(specSchema, filled)
    if (Object.values(errors.value).some(Boolean)) return
    const previousStatus = selectedSpec.value?.status
    const updated = await updateSpec(specId(), filled)
    if (!updated) {
      toast.error(error.value || 'Could not save the spec')
      return
    }
    editing.value = false
    // Revisions are snapshotted only on approve.
    if (filled.status === 'approved' && previousStatus !== 'approved') {
      await fetchRevisions(specId())
    }
    toast.success('Spec updated')
  }

  async function onStatus(status: string): Promise<void> {
    const previousStatus = selectedSpec.value?.status
    const updated = await updateSpec(specId(), { status: status as SpecStatus })
    if (!updated) {
      toast.error(error.value || 'Could not update status')
      return
    }
    if (status === 'approved' && previousStatus !== 'approved') {
      await fetchRevisions(specId())
    }
    toast.success('Status updated')
  }

  async function link(taskId: string): Promise<void> {
    const updated = await addTaskToSpec(specId(), taskId)
    linking.value = false
    if (updated) toast.success('Task linked')
    else toast.error(error.value || 'Could not link the task')
  }

  function startCreateTask(): void {
    creatingTask.value = true
    newTaskTitle.value = ''
  }

  function cancelCreateTask(): void {
    creatingTask.value = false
    newTaskTitle.value = ''
  }

  async function onCreateTask(): Promise<void> {
    const title = newTaskTitle.value.trim()
    if (!title) return
    const created = await createTask({ title, specId: specId() })
    if (!created) {
      toast.error(taskError.value || 'Could not create the task')
      return
    }
    cancelCreateTask()
    await fetchSpecById(specId())
    toast.success('Task created and linked')
  }

  async function onUnlink(taskId: string): Promise<void> {
    unlinkTaskId.value = null
    const updated = await unlinkTaskFromSpec(specId(), taskId)
    if (updated) toast.success('Task unlinked')
    else toast.error(error.value || 'Could not unlink the task')
  }

  async function onArchiveToggle(): Promise<void> {
    const archived = Boolean(selectedSpec.value?.archivedAt)
    const updated = archived ? await unarchiveSpec(specId()) : await archiveSpec(specId())
    if (updated) toast.success(archived ? 'Spec restored' : 'Spec archived')
    else toast.error(error.value || 'Could not update archive state')
  }

  async function onDelete(): Promise<void> {
    confirmDelete.value = false
    const ok = await deleteSpec(specId())
    if (!ok) {
      toast.error(error.value || 'Could not delete the spec')
      return
    }
    toast.success('Spec deleted')
    await router.push('/specs')
  }

  function openTask(taskId: string): void {
    void router.push(`/tasks/${taskId}`)
  }

  return {
    selectedSpec,
    revisions,
    isLoading,
    error,
    editing,
    linking,
    creatingTask,
    newTaskTitle,
    confirmDelete,
    unlinkTaskId,
    draft,
    errors,
    isAdmin,
    statusOptions,
    load,
    startEdit,
    save,
    onStatus,
    link,
    startCreateTask,
    cancelCreateTask,
    onCreateTask,
    onUnlink,
    onArchiveToggle,
    onDelete,
    openTask,
  }
}
