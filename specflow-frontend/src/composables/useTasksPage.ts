import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUsers } from '@/composables/useDashboard'
import { useTasks } from '@/composables/useTasks'
import { useToast } from '@/composables/useToast'
import type { TaskInput, TaskStatus } from '@/types'
import { moveTaskOnBoard, type BoardColumns } from '@/utils/boardMove'
import { taskStatuses } from '@/utils/status'

export function useTasksPage() {
  const route = useRoute()
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const { users, load: loadUsers } = useUsers()
  const {
    tasks,
    total,
    currentPage,
    isLoading,
    error,
    filters,
    fetchTasks,
    fetchBoardColumns,
    createTask,
    updateTask,
    patchTaskQuiet,
    bulkUpdate,
  } = useTasks()

  const creating = ref(false)
  const drawerRef = ref<{ stopSaving: () => void } | null>(null)
  const board = ref<BoardColumns | null>(null)
  const selected = ref<string[]>([])

  const preferredView = computed(() =>
    user.value?.preferences?.defaults?.tasksView === 'board' ? 'board' : 'list',
  )
  const view = computed(() => {
    if (route.query.view === 'board') return 'board'
    if (route.query.view === 'list') return 'list'
    return preferredView.value
  })
  const isAdmin = computed(() => user.value?.role === 'admin')
  const hasFilters = computed(() =>
    Boolean(
      filters.value.status ||
        filters.value.priority ||
        filters.value.assignedTo ||
        filters.value.q ||
        filters.value.due ||
        filters.value.blocked,
    ),
  )
  const emptyBoard = computed(() =>
    !board.value || taskStatuses.every((status) => (board.value?.[status]?.length ?? 0) === 0),
  )

  function listParams() {
    return {
      status: filters.value.status,
      priority: filters.value.priority,
      assignedTo: filters.value.assignedTo,
      q: filters.value.q,
      due: filters.value.due,
      blocked: filters.value.blocked,
    }
  }

  async function loadList(page = currentPage.value): Promise<void> {
    await fetchTasks(listParams(), page)
  }

  async function loadBoard(): Promise<void> {
    const { status: _status, ...rest } = listParams()
    board.value = await fetchBoardColumns(rest)
  }

  function load(): void {
    if (view.value === 'board') void loadBoard()
    else void loadList(1)
  }

  function setView(next: 'list' | 'board'): void {
    void router.replace({ query: { ...route.query, view: next } })
  }

  function open(id: string): void {
    void router.push(`/tasks/${id}`)
  }

  function toggleSelect(id: string, on: boolean): void {
    selected.value = on
      ? [...new Set([...selected.value, id])]
      : selected.value.filter((item) => item !== id)
  }

  function toggleAll(on: boolean): void {
    selected.value = on ? tasks.value.map((task) => task.id) : []
  }

  async function onBulkStatus(status: TaskStatus): Promise<void> {
    const count = await bulkUpdate(selected.value, { status })
    if (count == null) {
      toast.error(error.value || 'Bulk update failed')
      return
    }
    selected.value = []
    toast.success(`Updated ${count} task(s)`)
    load()
  }

  async function onBulkAssign(userId: string): Promise<void> {
    const count = await bulkUpdate(selected.value, { assignedTo: userId })
    if (count == null) {
      toast.error(error.value || 'Bulk assign failed')
      return
    }
    selected.value = []
    toast.success(`Assigned ${count} task(s)`)
    load()
  }

  async function onStatus(id: string, status: TaskStatus): Promise<void> {
    if (view.value === 'board' && board.value) {
      const { next, previous, moved } = moveTaskOnBoard(board.value, id, status)
      if (!moved) return
      board.value = next
      const updated = await patchTaskQuiet(id, { status })
      if (!updated) {
        board.value = previous
        toast.error(error.value || 'Could not update status')
        return
      }
      toast.success('Status updated')
      return
    }
    const updated = await updateTask(id, { status })
    if (!updated) {
      toast.error(error.value || 'Could not update status')
      return
    }
    toast.success('Status updated')
  }

  async function onCreate(input: TaskInput): Promise<void> {
    const created = await createTask(input)
    drawerRef.value?.stopSaving()
    if (!created) {
      toast.error(error.value || 'Could not create the task')
      return
    }
    creating.value = false
    toast.success('Task created')
    load()
  }

  onMounted(() => {
    if (typeof route.query.status === 'string') filters.value.status = route.query.status
    if (typeof route.query.due === 'string') filters.value.due = route.query.due
    if (typeof route.query.blocked === 'string') filters.value.blocked = route.query.blocked
    if (typeof route.query.q === 'string') filters.value.q = route.query.q
    if (typeof route.query.assignedTo === 'string') {
      filters.value.assignedTo = route.query.assignedTo
    } else if (
      user.value?.preferences?.defaults?.tasksScope === 'mine' &&
      user.value.id
    ) {
      filters.value.assignedTo = user.value.id
    }
    if (!route.query.view && preferredView.value === 'board') {
      void router.replace({ query: { ...route.query, view: 'board' } })
    }
    if (isAdmin.value) void loadUsers()
    load()
  })

  watch(
    filters,
    () => {
      selected.value = []
      load()
    },
    { deep: true },
  )
  watch(view, () => {
    selected.value = []
    load()
  })

  return {
    user,
    users,
    tasks,
    total,
    currentPage,
    isLoading,
    error,
    filters,
    creating,
    drawerRef,
    board,
    selected,
    view,
    isAdmin,
    hasFilters,
    emptyBoard,
    load,
    loadList,
    setView,
    open,
    toggleSelect,
    toggleAll,
    onBulkStatus,
    onBulkAssign,
    onStatus,
    onCreate,
  }
}
