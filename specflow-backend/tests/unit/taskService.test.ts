import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, findById, create, countDocuments } = vi.hoisted(() => ({
  find: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  countDocuments: vi.fn(),
}))

vi.mock('../../src/models/Task', () => ({
  Task: { find, findById, create, countDocuments },
}))

vi.mock('../../src/models/Spec', () => ({
  Spec: { findById: vi.fn(), findByIdAndUpdate: vi.fn() },
}))

import * as taskService from '../../src/services/taskService'
import { AppError } from '../../src/utils/AppError'

function query(result: unknown) {
  const chain: Record<string, unknown> = {}
  chain.sort = () => chain
  chain.skip = () => chain
  chain.limit = () => chain
  chain.populate = () => chain
  chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve)
  return chain
}

const taskDoc = {
  id: 'task-1',
  title: 'Ship auth',
  description: '',
  status: 'backlog' as const,
  priority: 'medium' as const,
  assignedTo: null,
  createdBy: { id: 'user-1', name: 'Ada', email: 'ada@specflow.dev' },
  specId: null,
  tags: [],
  dueDate: null,
  createdAt: new Date('2026-09-01T00:00:00.000Z'),
  updatedAt: new Date('2026-09-02T00:00:00.000Z'),
}

describe('taskService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns a paginated list', async () => {
    find.mockReturnValue(query([taskDoc]))
    countDocuments.mockResolvedValue(1)
    const result = await taskService.getTasks({}, { page: 1, limit: 10 })
    expect(result.total).toBe(1)
    expect(result.data[0]?.title).toBe('Ship auth')
  })

  it('throws when a task is missing', async () => {
    findById.mockReturnValue(query(null))
    await expect(taskService.getTaskById('missing')).rejects.toBeInstanceOf(AppError)
  })

  it('creates a task for an admin', async () => {
    create.mockResolvedValue({ _id: 'task-1', id: 'task-1' })
    findById.mockReturnValue(query(taskDoc))
    const created = await taskService.createTask({ title: 'Ship auth' }, { id: 'user-1', role: 'admin' })
    expect(created.id).toBe('task-1')
  })

  it('refuses to create a task for a developer', async () => {
    await expect(taskService.createTask({ title: 'Nope' }, { id: 'user-2', role: 'developer' })).rejects.toMatchObject({
      statusCode: 403,
    })
  })
})
