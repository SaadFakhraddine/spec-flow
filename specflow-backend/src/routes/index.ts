import { Router } from 'express'
import { authRouter } from './auth'
import { dashboardRouter, userRouter } from './users'
import { specRouter } from './specs'
import { taskRouter } from './tasks'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/tasks', taskRouter)
apiRouter.use('/specs', specRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/dashboard', dashboardRouter)
