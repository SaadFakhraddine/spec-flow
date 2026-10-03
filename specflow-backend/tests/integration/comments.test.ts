import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { clearDb, loginAs, startMemory, stopMemory } from './helpers'

describe('comment routes', () => {
  beforeAll(startMemory)
  afterEach(clearDb)
  afterAll(stopMemory)

  async function createTask(admin: Awaited<ReturnType<typeof loginAs>>) {
    const created = await admin.agent
      .post('/tasks')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ title: 'Discuss cookies' })
    return created.body.data.id as string
  }

  it('lets authenticated users list and create comments', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const developer = await loginAs('developer', 'dev@specflow.dev')
    const taskId = await createTask(admin)

    const empty = await developer.agent
      .get(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${developer.token}`)
    expect(empty.status).toBe(200)
    expect(empty.body.data).toEqual([])

    const created = await developer.agent
      .post(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${developer.token}`)
      .send({ body: 'Looks good from the client side.' })
    expect(created.status).toBe(201)
    expect(created.body.data.body).toBe('Looks good from the client side.')
    expect(created.body.data.author.email).toBe('dev@specflow.dev')

    const listed = await admin.agent
      .get(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${admin.token}`)
    expect(listed.body.data).toHaveLength(1)
  })

  it('lets authors and admins delete comments, and blocks other developers', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const author = await loginAs('developer', 'author@specflow.dev')
    const other = await loginAs('developer', 'other@specflow.dev')
    const taskId = await createTask(admin)

    const created = await author.agent
      .post(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${author.token}`)
      .send({ body: 'Mine to keep or remove.' })
    const commentId = created.body.data.id as string

    const blocked = await other.agent
      .delete(`/tasks/${taskId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${other.token}`)
    expect(blocked.status).toBe(403)

    const byAuthor = await author.agent
      .delete(`/tasks/${taskId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${author.token}`)
    expect(byAuthor.status).toBe(200)

    const again = await author.agent
      .post(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${author.token}`)
      .send({ body: 'Admin will remove this.' })
    const adminDelete = await admin.agent
      .delete(`/tasks/${taskId}/comments/${again.body.data.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
    expect(adminDelete.status).toBe(200)
  })

  it('rejects empty bodies and unauthenticated access', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const taskId = await createTask(admin)
    const empty = await admin.agent
      .post(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ body: '   ' })
    expect(empty.status).toBe(400)
    const open = await admin.agent.get(`/tasks/${taskId}/comments`)
    expect(open.status).toBe(401)
  })
})
