import { Router } from 'express'
import { query } from 'express-validator'
import * as searchController from '../controllers/searchController'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'

export const searchRouter = Router()

searchRouter.get(
  '/',
  requireAuth,
  validate([query('q').optional().isString().trim().isLength({ max: 100 }).withMessage('Search is too long')]),
  searchController.search,
)
