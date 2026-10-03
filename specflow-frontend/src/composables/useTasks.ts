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
  })

  return {
    ...storeToRefs(store),
    filters,
    fetchTasks: store.fetchTasks,
    fetchTaskById: store.fetchTaskById,
    fetchBoardColumns: store.fetchBoardColumns,
    createTask: store.createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    assignTask: store.assignTask,
  }
}
