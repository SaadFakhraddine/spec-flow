import mongoose from 'mongoose'
import { env } from './env'
import { logger } from './logger'

const MAX_ATTEMPTS = 5
const DELAY_MS = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function tryConnect(attempt: number): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI)
    logger.info('MongoDB connected', { attempt })
  } catch (error) {
    if (attempt >= MAX_ATTEMPTS) throw error
    logger.warn('MongoDB connection failed, retrying', { attempt })
    await sleep(DELAY_MS)
    await tryConnect(attempt + 1)
  }
}

export async function connectDb(): Promise<void> {
  await tryConnect(1)
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
}
