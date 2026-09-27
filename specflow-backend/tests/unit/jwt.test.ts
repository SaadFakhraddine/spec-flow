import { describe, expect, it } from 'vitest'
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt'
import { AppError } from '../../src/utils/AppError'

describe('jwt', () => {
  it('round-trips an access token', () => {
    const token = generateAccessToken('user-1', 'admin')
    expect(verifyAccessToken(token)).toEqual({ sub: 'user-1', role: 'admin' })
  })

  it('round-trips a refresh token', () => {
    const token = generateRefreshToken('user-1', 3)
    expect(verifyRefreshToken(token)).toMatchObject({ sub: 'user-1', tv: 3 })
  })

  it('rejects a tampered token', () => {
    const token = generateAccessToken('user-1', 'developer')
    expect(() => verifyAccessToken(`${token}x`)).toThrow(AppError)
  })

  it('rejects an expired access token', () => {
    const token = generateAccessToken('user-1', 'admin')
    const broken = token.slice(0, -4)
    expect(() => verifyAccessToken(broken)).toThrow(AppError)
  })
})
