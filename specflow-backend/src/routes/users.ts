import { Router } from 'express'
import * as activityController from '../controllers/activityController'
import * as metaController from '../controllers/metaController'
import { requireAdmin, requireAuth } from '../middleware/auth'

export const userRouter = Router()
userRouter.get('/', requireAdmin, metaController.users)
userRouter.get('/mentionable', requireAuth, metaController.mentionable)

export const dashboardRouter = Router()
dashboardRouter.get('/', requireAuth, metaController.dashboard)
dashboardRouter.get('/activity', requireAuth, activityController.listRecent)
