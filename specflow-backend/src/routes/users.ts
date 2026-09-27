import { Router } from 'express'
import * as metaController from '../controllers/metaController'
import { requireAdmin, requireAuth } from '../middleware/auth'

export const userRouter = Router()
userRouter.get('/', requireAdmin, metaController.users)

export const dashboardRouter = Router()
dashboardRouter.get('/', requireAuth, metaController.dashboard)
