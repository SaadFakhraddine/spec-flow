import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import type { TaskFilters } from '@/types'

export function useTasks() {
  const store = useTasksStore()
  const filters = ref<TaskFilters>({
    status: '',
    priority: '',
    assignedTo: '',
    q: '',
    due: '',
  })

  return {
    ...storeToRefs(store),
    filters,
    fetchTasks: store.fetchTasks,
    fetchTaskById: store.fetchTaskById,
    fetchBoardColumns: store.fetchBoardColumns,
    createTask: store.createTask,
    updateTask: store.updateTask,
    patchTaskQuiet: store.patchTaskQuiet,
    deleteTask: store.deleteTask,
    assignTask: store.assignTask,
    bulkUpdate: store.bulkUpdate,
    watchTask: store.watchTask,
    unwatchTask: store.unwatchTask,
  }
}
