import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { filterTasks } from '@/utils/filters'

export function useTasks() {
  const store = useTasksStore()
  const filters = ref({ status: '', priority: '' })
  const visible = computed(() => filterTasks(store.tasks, filters.value))

  return {
    ...storeToRefs(store),
    filters,
    visible,
    fetchTasks: store.fetchTasks,
    fetchTaskById: store.fetchTaskById,
    createTask: store.createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    assignTask: store.assignTask,
  }
}
