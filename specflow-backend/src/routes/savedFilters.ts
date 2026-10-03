import { Router } from 'express'
import * as savedFilterController from '../controllers/savedFilterController'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  createSavedFilterValidator,
  savedFilterIdValidator,
} from '../validators/savedFilterValidators'

export const savedFilterRouter = Router()

savedFilterRouter.get('/', requireAuth, savedFilterController.list)
savedFilterRouter.post('/', requireAuth, validate(createSavedFilterValidator), savedFilterController.create)
savedFilterRouter.delete(
  '/:id',
  requireAuth,
  validate(savedFilterIdValidator),
  savedFilterController.remove,
)
