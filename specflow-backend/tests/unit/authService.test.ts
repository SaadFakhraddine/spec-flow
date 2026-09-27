import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../../src/utils/AppError'
import { generateRefreshToken } from '../../src/utils/jwt'

const { findOne, create, findById, findByIdAndUpdate } = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
}))

vi.mock('../../src/models/User', () => ({
  User: { findOne, create, findById, findByIdAndUpdate, find: vi.fn() },
}))

import * as authService from '../../src/services/authService'

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    name: 'Ada',
    email: 'ada@specflow.dev',
    role: 'developer' as const,
    tokenVersion: 0,
    comparePassword: vi.fn().mockResolvedValue(true),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registers a new user', async () => {
    findOne.mockResolvedValue(null)
    create.mockResolvedValue(user())
    const result = await authService.register('Ada', 'ada@specflow.dev', 'Password1')
    expect(result.user.email).toBe('ada@specflow.dev')
    expect(result.accessToken).toBeTruthy()
  })

  it('rejects a duplicate email', async () => {
    findOne.mockResolvedValue(user())
    await expect(authService.register('Ada', 'ada@specflow.dev', 'Password1')).rejects.toBeInstanceOf(AppError)
  })

  it('logs in with a matching password', async () => {
    const account = user()
    findOne.mockReturnValue({ select: () => Promise.resolve(account) })
    const result = await authService.login('ada@specflow.dev', 'Password1')
    expect(result.user.id).toBe('user-1')
  })

  it('rejects a bad password', async () => {
    const account = user({ comparePassword: vi.fn().mockResolvedValue(false) })
    findOne.mockReturnValue({ select: () => Promise.resolve(account) })
    await expect(authService.login('ada@specflow.dev', 'nope')).rejects.toMatchObject({ statusCode: 401 })
  })

  it('rotates a refresh token', async () => {
    const account = user({ tokenVersion: 2 })
    findById.mockReturnValue({ select: () => Promise.resolve(account) })
    const token = generateRefreshToken('user-1', 2)
    const result = await authService.refresh(token)
    expect(account.tokenVersion).toBe(3)
    expect(result.accessToken).toBeTruthy()
  })

  it('logs out by bumping the token version', async () => {
    findByIdAndUpdate.mockResolvedValue(undefined)
    const token = generateRefreshToken('user-1', 0)
    await authService.logout(token)
    expect(findByIdAndUpdate).toHaveBeenCalled()
  })
})
