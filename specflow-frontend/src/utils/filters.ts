export function pageWindow(current: number, totalPages: number): number[] {
  const start = Math.max(1, current - 2)
  const end = Math.min(totalPages, start + 4)
  const pages: number[] = []
  for (let page = Math.max(1, end - 4); page <= end; page += 1) pages.push(page)
  return pages
}

export function filterTasks<T extends { status: string; priority: string }>(
  tasks: T[],
  filters: { status?: string; priority?: string },
): T[] {
  return tasks.filter((task) => {
    const statusOk = !filters.status || task.status === filters.status
    const priorityOk = !filters.priority || task.priority === filters.priority
    return statusOk && priorityOk
  })
}
