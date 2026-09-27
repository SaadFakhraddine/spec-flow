import { storeToRefs } from 'pinia'
import { useSpecsStore } from '@/stores/specs'

export function useSpecs() {
  const store = useSpecsStore()
  return {
    ...storeToRefs(store),
    fetchSpecs: store.fetchSpecs,
    fetchSpecById: store.fetchSpecById,
    createSpec: store.createSpec,
    updateSpec: store.updateSpec,
    addTaskToSpec: store.addTaskToSpec,
  }
}
