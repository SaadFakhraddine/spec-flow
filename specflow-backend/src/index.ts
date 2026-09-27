import { app } from './app'
import { connectDb } from './config/db'
import { env } from './config/env'
import { logger } from './config/logger'

async function start(): Promise<void> {
  await connectDb()
  app.listen(env.PORT, () => {
    logger.info('Server started', { port: env.PORT })
  })
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'unknown'
  logger.error('Startup failed', { message })
  process.exit(1)
})
