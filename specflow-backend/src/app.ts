import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { logger } from './config/logger'
import { errorHandler } from './middleware/errorHandler'
import { apiRouter } from './routes'

export const app = express()

/** Required behind Render/Vercel so rate limits use the real client IP. */
app.set('trust proxy', 1)

app.use(helmet())
app.use((_req, res, next) => {
  res.setHeader('X-XSS-Protection', '0')
  next()
})
const allowedOrigins = env.NODE_ENV === 'production'
  ? [env.FRONTEND_URL]
  : Array.from(
      new Set([
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
      ]),
    )

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.morganStream }))

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.use(apiRouter)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(errorHandler)
