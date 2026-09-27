import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createAuthRateLimiter } from '../../src/middleware/rateLimiter'

describe('auth rate limiter', () => {
  it('blocks the third request inside the window', async () => {
    const app = express()
    app.use(createAuthRateLimiter(2))
    app.get('/auth/ping', (_req, res) => {
      res.json({ success: true })
    })
    const first = await request(app).get('/auth/ping')
    const second = await request(app).get('/auth/ping')
    const third = await request(app).get('/auth/ping')
    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(third.status).toBe(429)
    expect(third.body.message).toMatch(/Too many requests/)
  })
})
