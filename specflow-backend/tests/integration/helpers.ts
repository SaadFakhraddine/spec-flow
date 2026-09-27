import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request, { type Agent } from 'supertest'
import { app } from '../../src/app'
import { User } from '../../src/models/User'

let mongo: MongoMemoryServer | undefined

export async function startMemory(): Promise<void> {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
}

export async function stopMemory(): Promise<void> {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
}

export async function clearDb(): Promise<void> {
  const collections = Object.values(mongoose.connection.collections)
  for (const collection of collections) await collection.deleteMany({})
}

export function http(): Agent {
  return request.agent(app)
}

export async function loginAs(role: 'admin' | 'developer', email: string) {
  const password = 'Password1'
  await User.create({ name: role, email, password, role })
  const agent = request.agent(app)
  const response = await agent.post('/auth/login').send({ email, password })
  return {
    agent,
    token: response.body.data.accessToken as string,
    userId: response.body.data.user.id as string,
  }
}
