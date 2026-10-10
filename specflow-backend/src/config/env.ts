import dotenv from 'dotenv'

dotenv.config()

const REQUIRED = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_URL'] as const
const MIN_SECRET_LENGTH = 32

function readRequired(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function readSecret(name: string): string {
  const value = readRequired(name)
  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(`${name} must be at least ${MIN_SECRET_LENGTH} characters`)
  }
  return value
}

function readPort(): number {
  const port = Number(readRequired('PORT'))
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer')
  }
  return port
}

function readFrontendUrl(): string {
  const value = readRequired('FRONTEND_URL').replace(/\/$/, '')
  const nodeEnv = process.env.NODE_ENV ?? 'development'
  if (nodeEnv === 'production') {
    let parsed: URL
    try {
      parsed = new URL(value)
    } catch {
      throw new Error('FRONTEND_URL must be a valid URL')
    }
    if (parsed.protocol !== 'https:') {
      throw new Error('FRONTEND_URL must use https in production')
    }
  }
  return value
}

function readBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name]
  if (raw == null || raw.trim() === '') return fallback
  return raw === '1' || raw.toLowerCase() === 'true'
}

function loadEnv() {
  for (const name of REQUIRED) readRequired(name)
  const nodeEnv = process.env.NODE_ENV ?? 'development'
  return {
    PORT: readPort(),
    MONGODB_URI: readRequired('MONGODB_URI'),
    JWT_SECRET: readSecret('JWT_SECRET'),
    JWT_REFRESH_SECRET: readSecret('JWT_REFRESH_SECRET'),
    FRONTEND_URL: readFrontendUrl(),
    NODE_ENV: nodeEnv,
    /**
     * When true, refresh cookie uses SameSite=Lax (for SPA same-origin `/api` proxy).
     * When false, uses SameSite=None; Partitioned for direct cross-site browser calls.
     */
    REFRESH_COOKIE_FIRST_PARTY: readBool('REFRESH_COOKIE_FIRST_PARTY', false),
    /** When false, POST /auth/register returns 403. Defaults off in production. */
    ALLOW_PUBLIC_REGISTER: readBool('ALLOW_PUBLIC_REGISTER', nodeEnv !== 'production'),
  }
}

export const env = loadEnv()
