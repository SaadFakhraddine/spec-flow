import { body, param, query } from 'express-validator'
import { SPEC_STATUSES } from '../types/api.types'

const criteria = body('acceptanceCriteria.*')
  .isString()
  .trim()
  .notEmpty()
  .isLength({ max: 300 })
  .withMessage('Each acceptance criterion must be a short sentence')

export const listSpecValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
]

export const createSpecValidator = [
  body('title').trim().notEmpty().isLength({ max: 150 }).withMessage('Title is required and must be at most 150 characters'),
  body('businessGoal').trim().notEmpty().isLength({ max: 1000 }).withMessage('Business goal is required'),
  body('technicalApproach').trim().notEmpty().isLength({ max: 5000 }).withMessage('Technical approach is required'),
  body('apiDesign').optional().isString().isLength({ max: 3000 }).withMessage('API design must be at most 3000 characters'),
  body('edgeCases').optional().isArray().withMessage('Edge cases must be a list'),
  body('edgeCases.*').optional().isString().isLength({ max: 300 }).withMessage('Each edge case must be at most 300 characters'),
  body('acceptanceCriteria').isArray({ min: 1 }).withMessage('Add at least one acceptance criterion'),
  criteria,
  body('regressionRisks').optional().isString().isLength({ max: 1000 }).withMessage('Regression risks must be at most 1000 characters'),
  body('status').optional().isIn(SPEC_STATUSES).withMessage('Invalid status'),
]

export const updateSpecValidator = [
  param('id').isMongoId().withMessage('Invalid spec id'),
  body('title').optional().trim().notEmpty().isLength({ max: 150 }).withMessage('Title must be at most 150 characters'),
  body('businessGoal').optional().trim().notEmpty().isLength({ max: 1000 }).withMessage('Business goal is required'),
  body('technicalApproach').optional().trim().notEmpty().isLength({ max: 5000 }).withMessage('Technical approach is required'),
  body('apiDesign').optional().isString().isLength({ max: 3000 }).withMessage('API design must be at most 3000 characters'),
  body('edgeCases').optional().isArray().withMessage('Edge cases must be a list'),
  body('acceptanceCriteria').optional().isArray({ min: 1 }).withMessage('Add at least one acceptance criterion'),
  body('acceptanceCriteria.*').optional().isString().trim().notEmpty().isLength({ max: 300 }).withMessage('Each acceptance criterion must be a short sentence'),
  body('regressionRisks').optional().isString().isLength({ max: 1000 }).withMessage('Regression risks must be at most 1000 characters'),
  body('status').optional().isIn(SPEC_STATUSES).withMessage('Invalid status'),
]

export const linkTaskValidator = [
  param('id').isMongoId().withMessage('Invalid spec id'),
  body('taskId').isMongoId().withMessage('Invalid task id'),
]

export const specIdValidator = [param('id').isMongoId().withMessage('Invalid spec id')]
