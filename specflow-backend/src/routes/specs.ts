import { Router } from 'express'
import * as specController from '../controllers/specController'
import { requireAdmin, requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  createSpecValidator,
  linkTaskValidator,
  listSpecValidator,
  specIdValidator,
  updateSpecValidator,
} from '../validators/specValidators'

export const specRouter = Router()

specRouter.get('/', requireAuth, validate(listSpecValidator), specController.list)
specRouter.get('/:id', requireAuth, validate(specIdValidator), specController.getOne)
specRouter.post('/', requireAdmin, validate(createSpecValidator), specController.create)
specRouter.patch('/:id', requireAdmin, validate(updateSpecValidator), specController.update)
specRouter.post('/:id/tasks', requireAdmin, validate(linkTaskValidator), specController.linkTask)
