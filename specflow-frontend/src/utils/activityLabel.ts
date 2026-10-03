import type { ActivityItem } from '@/types'

export function activityLabel(item: ActivityItem): string {
  const name = item.actor.name
  switch (item.type) {
    case 'task.created':
      return `${name} created this task`
    case 'task.status':
      return `${name} moved status from ${String(item.meta.from ?? '?')} to ${String(item.meta.to ?? '?')}`
    case 'task.assigned':
      return `${name} changed the assignee`
    case 'comment.created':
      return `${name} commented`
    case 'spec.status':
      return `${name} set spec status to ${String(item.meta.to ?? '?')}`
    default:
      return `${name} updated work`
  }
}
