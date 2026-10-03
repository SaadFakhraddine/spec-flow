import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { clearDb, loginAs, startMemory, stopMemory } from './helpers'

describe('notification routes', () => {
  beforeAll(startMemory)
  afterEach(clearDb)
  afterAll(stopMemory)

  it('notifies an assignee and marks notifications read', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const developer = await loginAs('developer', 'dev@specflow.dev')
    const created = await admin.agent
      .post('/tasks')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ title: 'Notify me' })
    const taskId = created.body.data.id as string

    await admin.agent
      .post(`/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId: developer.userId })

    const listed = await developer.agent
      .get('/notifications')
      .set('Authorization', `Bearer ${developer.token}`)
    expect(listed.status).toBe(200)
    expect(listed.body.data.length).toBeGreaterThan(0)
    const id = listed.body.data[0].id as string

    const read = await developer.agent
      .patch(`/notifications/${id}/read`)
      .set('Authorization', `Bearer ${developer.token}`)
    expect(read.body.data.readAt).toBeTruthy()

    await developer.agent
      .post('/notifications/read-all')
      .set('Authorization', `Bearer ${developer.token}`)
    const again = await developer.agent
      .get('/notifications')
      .set('Authorization', `Bearer ${developer.token}`)
    expect(again.body.data.every((item: { readAt: string | null }) => item.readAt)).toBe(true)
  })
})
