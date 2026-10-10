import { describe, expect, it } from 'vitest'
import { adminPatch, developerPatch } from '../../src/services/taskPatch'
import { AppError } from '../../src/utils/AppError'

describe('task patches', () => {
  it('lets a developer change status', () => {
    expect(developerPatch({ title: 'ignored', status: 'done' })).toEqual({ status: 'done' })
  })

  it('lets a developer update blockers without status', () => {
    expect(developerPatch({ title: 'ignored', blockedReason: 'Waiting on API' })).toEqual({
      blockedReason: 'Waiting on API',
    })
  })

  it('rejects a developer update of title only', () => {
    expect(() => developerPatch({ title: 'Nope' })).toThrow(AppError)
  })

  it('lets an admin change title and due date', () => {
    const patch = adminPatch({ title: 'Ship it', dueDate: null, priority: 'high' })
    expect(patch.title).toBe('Ship it')
    expect(patch.dueDate).toBeNull()
    expect(patch.priority).toBe('high')
  })

  it('rejects unsafe external URLs', () => {
    expect(() => developerPatch({ status: 'done', externalUrl: 'javascript:alert(1)' })).toThrow(AppError)
    expect(developerPatch({ status: 'done', externalUrl: 'https://example.com/doc' })).toEqual({
      status: 'done',
      externalUrl: 'https://example.com/doc',
    })
  })
})
