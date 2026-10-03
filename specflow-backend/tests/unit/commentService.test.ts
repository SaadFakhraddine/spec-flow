import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import * as commentService from '../../src/services/commentService'
import { Task } from '../../src/models/Task'
import { User } from '../../src/models/User'
import { AppError } from '../../src/utils/AppError'

let mongo: MongoMemoryServer

describe('commentService', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    await mongoose.connect(mongo.getUri())
  })

  afterEach(async () => {
    const collections = Object.values(mongoose.connection.collections)
    for (const collection of collections) await collection.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  async function seed() {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.dev',
      password: 'Password1',
      role: 'admin',
    })
    const developer = await User.create({
      name: 'Dev',
      email: 'dev@test.dev',
      password: 'Password1',
      role: 'developer',
    })
    const task = await Task.create({
      title: 'Comment target',
      createdBy: admin.id,
    })
    return { admin, developer, task }
  }

  it('creates and lists comments for a task', async () => {
    const { admin, developer, task } = await seed()
    await commentService.createComment(task.id, 'First note', {
      id: developer.id,
      role: 'developer',
    })
    const listed = await commentService.listComments(task.id)
    expect(listed).toHaveLength(1)
    expect(listed[0]?.author.id).toBe(developer.id)
    expect(listed[0]?.body).toBe('First note')
    await expect(
      commentService.listComments(admin.id),
    ).rejects.toBeInstanceOf(AppError)
  })

  it('enforces delete ownership', async () => {
    const { admin, developer, task } = await seed()
    const other = await User.create({
      name: 'Other',
      email: 'other@test.dev',
      password: 'Password1',
      role: 'developer',
    })
    const comment = await commentService.createComment(task.id, 'Keep private', {
      id: developer.id,
      role: 'developer',
    })
    await expect(
      commentService.deleteComment(task.id, comment.id, { id: other.id, role: 'developer' }),
    ).rejects.toMatchObject({ statusCode: 403 })
    await commentService.deleteComment(task.id, comment.id, { id: admin.id, role: 'admin' })
    expect(await commentService.listComments(task.id)).toHaveLength(0)
  })
})
