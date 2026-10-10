import { storeToRefs } from 'pinia'
import { useSpecsStore } from '@/stores/specs'

export function useSpecs() {
  const store = useSpecsStore()
  return {
    ...storeToRefs(store),
    fetchSpecs: store.fetchSpecs,
    fetchPipeline: store.fetchPipeline,
    fetchSpecById: store.fetchSpecById,
    fetchRevisions: store.fetchRevisions,
    createSpec: store.createSpec,
    updateSpec: store.updateSpec,
    archiveSpec: store.archiveSpec,
    unarchiveSpec: store.unarchiveSpec,
    deleteSpec: store.deleteSpec,
    addTaskToSpec: store.addTaskToSpec,
    unlinkTaskFromSpec: store.unlinkTaskFromSpec,
    exportCsv: store.exportCsv,
  }
}
