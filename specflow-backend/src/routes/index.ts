import { Router } from 'express'
import * as myWorkController from '../controllers/myWorkController'
import { requireAuth } from '../middleware/auth'
import { apiRateLimiter } from '../middleware/rateLimiter'
import { authRouter } from './auth'
import { notificationRouter } from './notifications'
import { savedFilterRouter } from './savedFilters'
import { searchRouter } from './search'
import { dashboardRouter, userRouter } from './users'
import { specRouter } from './specs'
import { taskRouter } from './tasks'

export const apiRouter = Router()

apiRouter.use(apiRateLimiter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/tasks', taskRouter)
apiRouter.use('/specs', specRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/notifications', notificationRouter)
apiRouter.use('/search', searchRouter)
apiRouter.use('/saved-filters', savedFilterRouter)
apiRouter.get('/me/work', requireAuth, myWorkController.getMyWork)
