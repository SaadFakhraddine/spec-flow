export interface ChecklistItem {
  key: string
  label: string
  done: boolean
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { key: 'tests', label: 'Tests', done: false },
  { key: 'pr', label: 'PR ready', done: false },
  { key: 'reviewed', label: 'Reviewed', done: false },
]

export function normalizeChecklist(items: ChecklistItem[] | undefined): ChecklistItem[] {
  if (!items?.length) return DEFAULT_CHECKLIST.map((item) => ({ ...item }))
  const byKey = new Map(items.map((item) => [item.key, item]))
  return DEFAULT_CHECKLIST.map((item) => ({
    ...item,
    done: Boolean(byKey.get(item.key)?.done),
  }))
}

export function checklistComplete(items: ChecklistItem[] | undefined): boolean {
  return normalizeChecklist(items).every((item) => item.done)
}
