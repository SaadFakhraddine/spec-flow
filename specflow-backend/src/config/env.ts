import dotenv from 'dotenv'

dotenv.config()

const REQUIRED = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_URL'] as const

function readRequired(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function readPort(): number {
  const port = Number(readRequired('PORT'))
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer')
  }
  return port
}

function loadEnv() {
  for (const name of REQUIRED) readRequired(name)
  return {
    PORT: readPort(),
    MONGODB_URI: readRequired('MONGODB_URI'),
    JWT_SECRET: readRequired('JWT_SECRET'),
    JWT_REFRESH_SECRET: readRequired('JWT_REFRESH_SECRET'),
    FRONTEND_URL: readRequired('FRONTEND_URL'),
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  }
}

export const env = loadEnv()
