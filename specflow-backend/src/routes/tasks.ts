import { Router } from 'express'
import * as activityController from '../controllers/activityController'
import * as commentController from '../controllers/commentController'
import * as taskController from '../controllers/taskController'
import { requireAdmin, requireAuth } from '../middleware/auth'
import { commentRateLimiter } from '../middleware/rateLimiter'
import { validate } from '../middleware/validate'
import {
  createCommentValidator,
  deleteCommentValidator,
  listCommentsValidator,
} from '../validators/commentValidators'
import {
  assignTaskValidator,
  bulkTaskValidator,
  createTaskValidator,
  listTaskValidator,
  taskIdValidator,
  updateTaskValidator,
} from '../validators/taskValidators'

export const taskRouter = Router()

taskRouter.get('/', requireAuth, validate(listTaskValidator), taskController.list)
taskRouter.post('/', requireAdmin, validate(createTaskValidator), taskController.create)
taskRouter.patch('/bulk', requireAuth, validate(bulkTaskValidator), taskController.bulk)
taskRouter.get('/:id/activity', requireAuth, validate(listCommentsValidator), activityController.listForTask)
taskRouter.get('/:id/comments', requireAuth, validate(listCommentsValidator), commentController.list)
taskRouter.post(
  '/:id/comments',
  requireAuth,
  commentRateLimiter,
  validate(createCommentValidator),
  commentController.create,
)
taskRouter.delete(
  '/:id/comments/:commentId',
  requireAuth,
  validate(deleteCommentValidator),
  commentController.remove,
)
taskRouter.get('/:id', requireAuth, validate(taskIdValidator), taskController.getOne)
taskRouter.patch('/:id', requireAuth, validate(updateTaskValidator), taskController.update)
taskRouter.delete('/:id', requireAuth, validate(taskIdValidator), taskController.remove)
taskRouter.post('/:id/assign', requireAdmin, validate(assignTaskValidator), taskController.assign)
taskRouter.post('/:id/watch', requireAuth, validate(taskIdValidator), taskController.watch)
taskRouter.delete('/:id/watch', requireAuth, validate(taskIdValidator), taskController.unwatch)
