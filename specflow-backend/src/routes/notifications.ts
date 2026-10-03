import { Router } from 'express'
import * as notificationController from '../controllers/notificationController'
import { requireAuth } from '../middleware/auth'
import { commentRateLimiter } from '../middleware/rateLimiter'
import { validate } from '../middleware/validate'
import { notificationIdValidator } from '../validators/notificationValidators'

export const notificationRouter = Router()

notificationRouter.get('/', requireAuth, notificationController.list)
notificationRouter.patch(
  '/:id/read',
  requireAuth,
  commentRateLimiter,
  validate(notificationIdValidator),
  notificationController.readOne,
)
notificationRouter.post('/read-all', requireAuth, commentRateLimiter, notificationController.readAll)
