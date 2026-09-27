import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { clearDb, loginAs, startMemory, stopMemory } from './helpers'

describe('task routes', () => {
  beforeAll(startMemory)
  afterEach(clearDb)
  afterAll(stopMemory)

  it('lets an admin create, filter, assign, and delete a task', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const developer = await loginAs('developer', 'dev@specflow.dev')
    const created = await admin.agent.post('/tasks').set('Authorization', `Bearer ${admin.token}`).send({
      title: 'Write the spec',
      description: 'Cover refresh tokens',
      priority: 'high',
      tags: ['auth'],
    })
    expect(created.status).toBe(201)
    const id = created.body.data.id as string

    const assigned = await admin.agent
      .post(`/tasks/${id}/assign`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId: developer.userId })
    expect(assigned.body.data.assignedTo.email).toBe('dev@specflow.dev')

    const listed = await developer.agent.get('/tasks?priority=high').set('Authorization', `Bearer ${developer.token}`)
    expect(listed.body.total).toBe(1)
    expect(listed.body.data[0].title).toBe('Write the spec')

    const removed = await admin.agent.delete(`/tasks/${id}`).set('Authorization', `Bearer ${admin.token}`)
    expect(removed.status).toBe(200)
  })

  it('lets a developer change status and blocks other edits', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const developer = await loginAs('developer', 'dev@specflow.dev')
    const created = await admin.agent.post('/tasks').set('Authorization', `Bearer ${admin.token}`).send({ title: 'Review API' })
    const id = created.body.data.id as string

    const forbidden = await developer.agent.post('/tasks').set('Authorization', `Bearer ${developer.token}`).send({ title: 'Nope' })
    expect(forbidden.status).toBe(403)

    const status = await developer.agent
      .patch(`/tasks/${id}`)
      .set('Authorization', `Bearer ${developer.token}`)
      .send({ status: 'in-review' })
    expect(status.body.data.status).toBe('in-review')

    const title = await developer.agent
      .patch(`/tasks/${id}`)
      .set('Authorization', `Bearer ${developer.token}`)
      .send({ title: 'Hijacked' })
    expect(title.status).toBe(403)
  })

  it('returns 404 for an unknown task and 401 without a token', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const missing = await admin.agent.get('/tasks/507f1f77bcf86cd799439011').set('Authorization', `Bearer ${admin.token}`)
    expect(missing.status).toBe(404)
    const open = await admin.agent.get('/tasks')
    expect(open.status).toBe(401)
  })
})
