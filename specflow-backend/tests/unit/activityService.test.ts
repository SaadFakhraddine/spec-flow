import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { listRecentActivity, listTaskActivity, recordActivity } from '../../src/services/activityService'
import { User } from '../../src/models/User'
import { Task } from '../../src/models/Task'

let mongo: MongoMemoryServer

describe('activityService', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    await mongoose.connect(mongo.getUri())
  })

  afterEach(async () => {
    for (const collection of Object.values(mongoose.connection.collections)) {
      await collection.deleteMany({})
    }
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  it('records and lists task activity', async () => {
    const user = await User.create({
      name: 'Ada',
      email: 'ada@test.dev',
      password: 'Password1',
      role: 'admin',
    })
    const task = await Task.create({ title: 'Track me', createdBy: user.id })
    await recordActivity({
      actorId: user.id,
      type: 'task.created',
      taskId: task.id,
      meta: { title: 'Track me' },
    })
    const listed = await listTaskActivity(task.id)
    expect(listed).toHaveLength(1)
    expect(listed[0]?.actor.name).toBe('Ada')
    const recent = await listRecentActivity()
    expect(recent[0]?.type).toBe('task.created')
  })
})
