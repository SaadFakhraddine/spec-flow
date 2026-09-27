import type { ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'
import { logger } from '../config/logger'
import { AppError } from '../utils/AppError'

function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000
}

function fromAppError(error: AppError) {
  return { status: error.statusCode, message: error.message, errors: error.errors }
}

function fromKnown(error: unknown): { status: number; message: string; errors?: string[] } | null {
  if (error instanceof AppError) return fromAppError(error)
  if (isDuplicateKey(error)) return { status: 409, message: 'A record with that value already exists' }
  if (error instanceof mongoose.Error.CastError) return { status: 400, message: 'Invalid identifier' }
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((item) => item.message)
    return { status: 400, message: 'Validation failed', errors }
  }
  return null
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const known = fromKnown(error)
  const status = known?.status ?? 500
  if (status >= 500) {
    logger.error('Request failed', { message: error instanceof Error ? error.message : 'unknown' })
  }
  const body: { success: false; message: string; errors?: string[] } = {
    success: false,
    message: known?.message ?? 'Internal server error',
  }
  if (known?.errors && known.errors.length > 0) body.errors = known.errors
  res.status(status).json(body)
}
