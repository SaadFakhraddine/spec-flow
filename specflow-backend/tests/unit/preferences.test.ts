import { describe, expect, it } from 'vitest'
import { mergePreferences, normalizePreferences } from '../../src/utils/preferences'

describe('preferences', () => {
  it('reads nested prefs from plain objects', () => {
    const prefs = normalizePreferences({
      theme: 'dark',
      notifications: { taskAssigned: false },
      defaults: { tasksView: 'board' },
    })
    expect(prefs.theme).toBe('dark')
    expect(prefs.notifications.taskAssigned).toBe(false)
    expect(prefs.notifications.commentCreated).toBe(true)
    expect(prefs.defaults.tasksView).toBe('board')
  })

  it('reads nested prefs via toObject (mongoose-like)', () => {
    const prefs = normalizePreferences({
      theme: 'light',
      toObject() {
        return {
          theme: 'light',
          notifications: {
            toObject() {
              return { taskAssigned: false, commentCreated: true, mentionCreated: true, taskStatus: false }
            },
          },
          defaults: {
            toObject() {
              return { tasksView: 'board' }
            },
          },
        }
      },
    })
    expect(prefs.notifications.taskAssigned).toBe(false)
    expect(prefs.notifications.taskStatus).toBe(false)
    expect(prefs.defaults.tasksView).toBe('board')
  })

  it('merges partial notification and default patches', () => {
    const current = normalizePreferences(null)
    const next = mergePreferences(current, {
      notifications: { mentionCreated: false },
      defaults: { tasksView: 'board' },
    })
    expect(next.notifications.mentionCreated).toBe(false)
    expect(next.notifications.taskAssigned).toBe(true)
    expect(next.defaults.tasksView).toBe('board')
  })
})
