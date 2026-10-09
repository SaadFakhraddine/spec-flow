import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { clearDb, loginAs, startMemory, stopMemory } from './helpers'

const specBody = {
  title: 'Task assignment rules',
  businessGoal: 'Admins assign work. Developers move it forward.',
  technicalApproach: 'Role checks live in the service layer, not only the router.',
  acceptanceCriteria: ['A developer cannot create a spec.'],
  edgeCases: ['Missing spec id returns 404.'],
  status: 'in-review',
}

describe('spec and dashboard routes', () => {
  beforeAll(startMemory)
  afterEach(clearDb)
  afterAll(stopMemory)

  it('lets an admin create a spec and link a task', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const developer = await loginAs('developer', 'dev@specflow.dev')
    const denied = await developer.agent.post('/specs').set('Authorization', `Bearer ${developer.token}`).send(specBody)
    expect(denied.status).toBe(403)

    const created = await admin.agent.post('/specs').set('Authorization', `Bearer ${admin.token}`).send(specBody)
    expect(created.status).toBe(201)
    const specId = created.body.data.id as string

    const task = await admin.agent.post('/tasks').set('Authorization', `Bearer ${admin.token}`).send({ title: 'Link me' })
    const linked = await admin.agent
      .post(`/specs/${specId}/tasks`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ taskId: task.body.data.id })
    expect(linked.body.data.taskCount).toBe(1)
    expect(linked.body.data.tasks[0].title).toBe('Link me')

    const listed = await developer.agent.get('/specs').set('Authorization', `Bearer ${developer.token}`)
    expect(listed.body.total).toBe(1)
    expect(listed.body.data[0].taskCount).toBe(1)
  })

  it('rejects an empty spec and reports dashboard counts', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const invalid = await admin.agent.post('/specs').set('Authorization', `Bearer ${admin.token}`).send({ title: 'Only a title' })
    expect(invalid.status).toBe(400)

    await admin.agent.post('/specs').set('Authorization', `Bearer ${admin.token}`).send(specBody)
    await admin.agent.post('/tasks').set('Authorization', `Bearer ${admin.token}`).send({ title: 'Open work', status: 'backlog' })
    await admin.agent.post('/tasks').set('Authorization', `Bearer ${admin.token}`).send({ title: 'Finished', status: 'done' })

    const dashboard = await admin.agent.get('/dashboard').set('Authorization', `Bearer ${admin.token}`)
    expect(dashboard.body.data.totalTasks).toBe(2)
    expect(dashboard.body.data.openTasks).toBe(1)
    expect(dashboard.body.data.specsInReview).toBe(1)
    expect(dashboard.body.data.completedThisWeek).toBe(1)
    expect(dashboard.body.data.specsByStatus.inReview).toBe(1)
  })

  it('archives, deletes, and enforces status transitions', async () => {
    const admin = await loginAs('admin', 'admin@specflow.dev')
    const created = await admin.agent
      .post('/specs')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ ...specBody, status: 'draft' })
    const specId = created.body.data.id as string

    const skip = await admin.agent
      .patch(`/specs/${specId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'approved' })
    expect(skip.status).toBe(400)

    await admin.agent
      .patch(`/specs/${specId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'ready' })
    await admin.agent
      .patch(`/specs/${specId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'in-review' })
    const approved = await admin.agent
      .patch(`/specs/${specId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'approved' })
    expect(approved.status).toBe(200)
    expect(approved.body.data.approvedBy).toBeTruthy()

    const revisions = await admin.agent
      .get(`/specs/${specId}/revisions`)
      .set('Authorization', `Bearer ${admin.token}`)
    expect(revisions.body.data.length).toBe(1)

    await admin.agent.post(`/specs/${specId}/archive`).set('Authorization', `Bearer ${admin.token}`)
    const listed = await admin.agent.get('/specs').set('Authorization', `Bearer ${admin.token}`)
    expect(listed.body.total).toBe(0)

    const csv = await admin.agent
      .get('/specs/export.csv?includeArchived=true')
      .set('Authorization', `Bearer ${admin.token}`)
    expect(csv.status).toBe(200)
    expect(String(csv.text)).toContain('title')

    await admin.agent.delete(`/specs/${specId}`).set('Authorization', `Bearer ${admin.token}`)
    const gone = await admin.agent.get(`/specs/${specId}`).set('Authorization', `Bearer ${admin.token}`)
    expect(gone.status).toBe(404)
  })
})
