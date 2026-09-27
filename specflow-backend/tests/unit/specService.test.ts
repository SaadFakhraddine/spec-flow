import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, findById, create, countDocuments } = vi.hoisted(() => ({
  find: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  countDocuments: vi.fn(),
}))

vi.mock('../../src/models/Spec', () => ({
  Spec: { find, findById, create, countDocuments, findByIdAndUpdate: vi.fn() },
}))

vi.mock('../../src/models/Task', () => ({
  Task: { findById: vi.fn() },
}))

import * as specService from '../../src/services/specService'

function query(result: unknown) {
  const chain: Record<string, unknown> = {}
  chain.sort = () => chain
  chain.skip = () => chain
  chain.limit = () => chain
  chain.populate = () => chain
  chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve)
  return chain
}

const specDoc = {
  id: 'spec-1',
  title: 'Auth',
  businessGoal: 'Stay signed in safely',
  technicalApproach: 'Rotate refresh tokens',
  apiDesign: '',
  edgeCases: [],
  acceptanceCriteria: ['Refresh works'],
  regressionRisks: '',
  status: 'draft' as const,
  createdBy: { id: 'user-1', name: 'Ada', email: 'ada@specflow.dev' },
  tasks: [],
  createdAt: new Date('2026-09-01T00:00:00.000Z'),
  updatedAt: new Date('2026-09-02T00:00:00.000Z'),
}

describe('specService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists specs with a task count', async () => {
    find.mockReturnValue(query([specDoc]))
    countDocuments.mockResolvedValue(1)
    const result = await specService.getSpecs({ page: 1, limit: 10 })
    expect(result.data[0]?.taskCount).toBe(0)
    expect(result.total).toBe(1)
  })

  it('refuses spec creation for a developer', async () => {
    await expect(
      specService.createSpec(
        { title: 'Auth', businessGoal: 'Goal', technicalApproach: 'Plan', acceptanceCriteria: ['One'] },
        { id: 'user-2', role: 'developer' },
      ),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('creates a spec for an admin', async () => {
    create.mockResolvedValue({ id: 'spec-1' })
    findById.mockReturnValue(query({ ...specDoc, tasks: [] }))
    const created = await specService.createSpec(
      { title: 'Auth', businessGoal: 'Goal', technicalApproach: 'Plan', acceptanceCriteria: ['One'] },
      { id: 'user-1', role: 'admin' },
    )
    expect(created.title).toBe('Auth')
  })
})
