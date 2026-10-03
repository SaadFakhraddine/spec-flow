import rateLimit from 'express-rate-limit'

export function createAuthRateLimiter(max = 10) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Try again later.' },
  })
}

const defaultMax = process.env.NODE_ENV === 'test' ? 1000 : 10
export const authRateLimiter = createAuthRateLimiter(defaultMax)

export const commentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many comments. Try again later.' },
})
