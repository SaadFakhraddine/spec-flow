import { describe, expect, it } from 'vitest'
import { adminPatch, developerPatch } from '../../src/services/taskPatch'
import { AppError } from '../../src/utils/AppError'

describe('task patches', () => {
  it('lets a developer change only status', () => {
    expect(developerPatch({ title: 'ignored', status: 'done' })).toEqual({ status: 'done' })
  })

  it('rejects a developer update without status', () => {
    expect(() => developerPatch({ title: 'Nope' })).toThrow(AppError)
  })

  it('lets an admin change title and due date', () => {
    const patch = adminPatch({ title: 'Ship it', dueDate: null, priority: 'high' })
    expect(patch.title).toBe('Ship it')
    expect(patch.dueDate).toBeNull()
    expect(patch.priority).toBe('high')
  })
})
