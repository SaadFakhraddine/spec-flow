import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { requireAdmin, requireAuth } from '../../src/middleware/auth'
import { errorHandler } from '../../src/middleware/errorHandler'
import { generateAccessToken } from '../../src/utils/jwt'
import jwt from 'jsonwebtoken'

function build(admin = false) {
  const app = express()
  app.get('/secret', admin ? requireAdmin : requireAuth, (req, res) => {
    res.json({ id: req.user?.id, role: req.user?.role })
  })
  app.use(errorHandler)
  return app
}

describe('auth middleware', () => {
  it('rejects a missing token', async () => {
    const response = await request(build()).get('/secret')
    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })

  it('accepts a valid access token', async () => {
    const token = generateAccessToken('user-1', 'developer')
    const response = await request(build()).get('/secret').set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: 'user-1', role: 'developer' })
  })

  it('rejects an expired token', async () => {
    const token = jwt.sign(
      { sub: 'user-1', role: 'admin', exp: Math.floor(Date.now() / 1000) - 10 },
      process.env.JWT_SECRET ?? '',
    )
    const response = await request(build()).get('/secret').set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(401)
  })

  it('rejects a developer on an admin route', async () => {
    const token = generateAccessToken('user-1', 'developer')
    const response = await request(build(true)).get('/secret').set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(403)
  })
})
