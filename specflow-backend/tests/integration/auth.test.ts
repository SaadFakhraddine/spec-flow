import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { clearDb, http, startMemory, stopMemory } from './helpers'

describe('auth routes', () => {
  beforeAll(startMemory)
  afterEach(clearDb)
  afterAll(stopMemory)

  it('exposes a health check without a stack trace', async () => {
    const response = await http().get('/health')
    expect(response.status).toBe(200)
    expect(response.body.data.status).toBe('ok')
    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBeTruthy()
  })

  it('registers, reads the profile, and refreshes', async () => {
    const agent = http()
    const created = await agent.post('/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@specflow.dev',
      password: 'Password1',
    })
    expect(created.status).toBe(201)
    expect(created.body.data.user.role).toBe('developer')
    expect(created.headers['set-cookie']?.[0]).toMatch(/HttpOnly/i)

    const token = created.body.data.accessToken as string
    const me = await agent.get('/auth/me').set('Authorization', `Bearer ${token}`)
    expect(me.body.data.email).toBe('ada@specflow.dev')

    const refreshed = await agent.post('/auth/refresh')
    expect(refreshed.status).toBe(200)
    expect(refreshed.body.data.accessToken).toBeTruthy()
  })

  it('rejects invalid registration input', async () => {
    const response = await http().post('/auth/register').send({ name: '', email: 'nope', password: 'short' })
    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.length).toBeGreaterThan(0)
    expect(response.body.stack).toBeUndefined()
  })

  it('rejects a bad login', async () => {
    await http().post('/auth/register').send({ name: 'Ada', email: 'ada@specflow.dev', password: 'Password1' })
    const response = await http().post('/auth/login').send({ email: 'ada@specflow.dev', password: 'WrongPass1' })
    expect(response.status).toBe(401)
  })

  it('clears the session on logout', async () => {
    const agent = http()
    await agent.post('/auth/register').send({ name: 'Ada', email: 'ada@specflow.dev', password: 'Password1' })
    const response = await agent.post('/auth/logout')
    expect(response.status).toBe(200)
    const refreshed = await agent.post('/auth/refresh')
    expect(refreshed.status).toBe(401)
  })
})
