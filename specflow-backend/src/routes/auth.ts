import { Router } from 'express'
import * as authController from '../controllers/authController'
import { authRateLimiter } from '../middleware/rateLimiter'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { loginValidator, registerValidator } from '../validators/authValidators'

export const authRouter = Router()

authRouter.post('/register', authRateLimiter, validate(registerValidator), authController.register)
authRouter.post('/login', authRateLimiter, validate(loginValidator), authController.login)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', requireAuth, authController.me)
