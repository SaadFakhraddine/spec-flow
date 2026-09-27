import { Router } from 'express'
import * as taskController from '../controllers/taskController'
import { requireAdmin, requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  assignTaskValidator,
  createTaskValidator,
  listTaskValidator,
  taskIdValidator,
  updateTaskValidator,
} from '../validators/taskValidators'

export const taskRouter = Router()

taskRouter.get('/', requireAuth, validate(listTaskValidator), taskController.list)
taskRouter.get('/:id', requireAuth, validate(taskIdValidator), taskController.getOne)
taskRouter.post('/', requireAdmin, validate(createTaskValidator), taskController.create)
taskRouter.patch('/:id', requireAuth, validate(updateTaskValidator), taskController.update)
taskRouter.delete('/:id', requireAuth, validate(taskIdValidator), taskController.remove)
taskRouter.post('/:id/assign', requireAdmin, validate(assignTaskValidator), taskController.assign)
