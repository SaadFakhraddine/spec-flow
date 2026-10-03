import { describe, expect, it } from 'vitest'
import type { Task } from '@/types'
import { moveTaskOnBoard } from '@/utils/boardMove'

const base = {
  description: '',
  priority: 'medium' as const,
  assignedTo: null,
  createdBy: { id: '1', name: 'Ada', email: 'a@x.dev' },
  specId: null,
  tags: [],
  dueDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function task(id: string, status: Task['status']): Task {
  return { id, title: id, status, ...base }
}

describe('moveTaskOnBoard', () => {
  it('moves a task between columns and supports rollback snapshot', () => {
    const columns = {
      backlog: [task('a', 'backlog')],
      'in-progress': [task('b', 'in-progress')],
      'in-review': [],
      done: [],
    }
    const { next, previous, moved } = moveTaskOnBoard(columns, 'a', 'done')
    expect(moved?.status).toBe('done')
    expect(next.backlog).toHaveLength(0)
    expect(next.done.map((item) => item.id)).toEqual(['a'])
    expect(previous.backlog.map((item) => item.id)).toEqual(['a'])
  })

  it('no-ops when status is unchanged', () => {
    const columns = {
      backlog: [task('a', 'backlog')],
      'in-progress': [],
      'in-review': [],
      done: [],
    }
    const result = moveTaskOnBoard(columns, 'a', 'backlog')
    expect(result.moved).toBeNull()
    expect(result.next).toBe(columns)
  })
})
