import { Router } from 'express'
import * as activityController from '../controllers/activityController'
import * as commentController from '../controllers/commentController'
import * as specController from '../controllers/specController'
import { requireAdmin, requireAuth } from '../middleware/auth'
import { commentRateLimiter } from '../middleware/rateLimiter'
import { validate } from '../middleware/validate'
import {
  createCommentValidator,
  deleteCommentValidator,
  listCommentsValidator,
} from '../validators/commentValidators'
import {
  createSpecValidator,
  linkTaskValidator,
  listSpecValidator,
  specIdValidator,
  updateSpecValidator,
} from '../validators/specValidators'

export const specRouter = Router()

specRouter.get('/', requireAuth, validate(listSpecValidator), specController.list)
specRouter.get('/export.csv', requireAuth, validate(listSpecValidator), specController.exportCsv)
specRouter.get('/:id', requireAuth, validate(specIdValidator), specController.getOne)
specRouter.get(
  '/:id/revisions',
  requireAuth,
  validate(specIdValidator),
  specController.revisions,
)
specRouter.get(
  '/:id/activity',
  requireAuth,
  validate(listCommentsValidator),
  activityController.listForSpec,
)
specRouter.post('/', requireAdmin, validate(createSpecValidator), specController.create)
specRouter.patch('/:id', requireAdmin, validate(updateSpecValidator), specController.update)
specRouter.post('/:id/archive', requireAdmin, validate(specIdValidator), specController.archive)
specRouter.post('/:id/unarchive', requireAdmin, validate(specIdValidator), specController.unarchive)
specRouter.delete('/:id', requireAdmin, validate(specIdValidator), specController.remove)
specRouter.post('/:id/tasks', requireAdmin, validate(linkTaskValidator), specController.linkTask)
specRouter.get(
  '/:id/comments',
  requireAuth,
  validate(listCommentsValidator),
  commentController.listForSpec,
)
specRouter.post(
  '/:id/comments',
  requireAuth,
  commentRateLimiter,
  validate(createCommentValidator),
  commentController.createForSpec,
)
specRouter.delete(
  '/:id/comments/:commentId',
  requireAuth,
  validate(deleteCommentValidator),
  commentController.removeForSpec,
)
