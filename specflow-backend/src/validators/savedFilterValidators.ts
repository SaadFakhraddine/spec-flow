import { body, param } from 'express-validator'

export const createSavedFilterValidator = [
  body('name').trim().notEmpty().isLength({ max: 40 }).withMessage('Name is required (max 40)'),
  body('query').isObject().withMessage('Query is required'),
  body('query.status').optional().isString().isLength({ max: 40 }),
  body('query.priority').optional().isString().isLength({ max: 40 }),
  body('query.assignedTo').optional().isString().isLength({ max: 40 }),
  body('query.q').optional().isString().isLength({ max: 100 }),
  body('query.due').optional().isString().isLength({ max: 20 }),
]

export const savedFilterIdValidator = [param('id').isMongoId().withMessage('Invalid filter id')]
