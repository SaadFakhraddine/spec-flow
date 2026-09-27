import type { Role } from './api.types'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: Role
      }
    }
  }
}

export {}
