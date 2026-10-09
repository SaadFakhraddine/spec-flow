import { describe, expect, it } from 'vitest'
import { allowedSpecStatuses, assertSpecTransition, nextSpecStatus } from '../../src/utils/specTransitions'

describe('specTransitions', () => {
  it('advances one step at a time', () => {
    expect(nextSpecStatus('draft')).toBe('ready')
    expect(nextSpecStatus('approved')).toBeNull()
    expect(() => assertSpecTransition('draft', 'approved')).toThrow(/ready/)
    expect(() => assertSpecTransition('ready', 'ready')).not.toThrow()
    expect(allowedSpecStatuses('in-review')).toEqual(['in-review', 'approved'])
  })
})
