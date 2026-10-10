import { describe, expect, it } from 'vitest'
import { activityLabel } from '@/utils/activityLabel'
import type { ActivityItem } from '@/types'

const base = {
  id: '1',
  taskId: 't1',
  specId: null,
  meta: {},
  createdAt: new Date().toISOString(),
  actor: { id: 'u1', name: 'Alex Rivera', email: 'admin@specflow.dev' },
} satisfies Omit<ActivityItem, 'type'>

describe('activityLabel', () => {
  it('uses the actor name for other users', () => {
    const item: ActivityItem = { ...base, type: 'comment.created' }
    expect(activityLabel(item, 'someone-else')).toBe('Alex Rivera commented')
  })

  it('says You when the actor is the current user', () => {
    const item: ActivityItem = {
      ...base,
      type: 'task.status',
      meta: { from: 'backlog', to: 'in-progress' },
    }
    expect(activityLabel(item, 'u1')).toBe('You moved status from backlog to in-progress')
  })
})
