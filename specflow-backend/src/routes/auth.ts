import { Router } from 'express'
import * as authController from '../controllers/authController'
import * as profileController from '../controllers/profileController'
import { authRateLimiter, refreshRateLimiter } from '../middleware/rateLimiter'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  loginValidator,
  preferencesValidator,
  profileValidator,
  registerValidator,
} from '../validators/authValidators'

export const authRouter = Router()

authRouter.post('/register', authRateLimiter, validate(registerValidator), authController.register)
authRouter.post('/login', authRateLimiter, validate(loginValidator), authController.login)
authRouter.post('/refresh', refreshRateLimiter, authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', requireAuth, authController.me)
authRouter.get('/me/profile', requireAuth, profileController.getProfile)
authRouter.patch('/me', requireAuth, validate(profileValidator), authController.updateProfile)
authRouter.patch(
  '/me/preferences',
  requireAuth,
  validate(preferencesValidator),
  authController.updatePreferences,
)
