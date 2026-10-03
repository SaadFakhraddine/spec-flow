import { body, param, query } from 'express-validator'
import { TASK_PRIORITIES, TASK_STATUSES } from '../types/api.types'

export const listTaskValidator = [
  query('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status'),
  query('priority').optional().isIn(TASK_PRIORITIES).withMessage('Invalid priority'),
  query('assignedTo').optional().isMongoId().withMessage('Invalid assignee'),
  query('q').optional().isString().isLength({ max: 100 }).withMessage('Search is too long'),
  query('due').optional().isIn(['overdue', 'soon']).withMessage('Invalid due filter'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
]

export const createTaskValidator = [
  body('title').trim().notEmpty().isLength({ max: 100 }).withMessage('Title is required and must be at most 100 characters'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  body('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status'),
  body('priority').optional().isIn(TASK_PRIORITIES).withMessage('Invalid priority'),
  body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee'),
  body('specId').optional({ nullable: true }).isMongoId().withMessage('Invalid spec'),
  body('tags').optional().isArray({ max: 5 }).withMessage('At most 5 tags'),
  body('tags.*').optional().isString().isLength({ min: 1, max: 20 }).withMessage('Each tag must be at most 20 characters'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
]

export const updateTaskValidator = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('title').optional().trim().notEmpty().isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  body('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status'),
  body('priority').optional().isIn(TASK_PRIORITIES).withMessage('Invalid priority'),
  body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee'),
  body('tags').optional().isArray({ max: 5 }).withMessage('At most 5 tags'),
  body('tags.*').optional().isString().isLength({ min: 1, max: 20 }).withMessage('Each tag must be at most 20 characters'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
]

export const assignTaskValidator = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('userId').isMongoId().withMessage('Invalid assignee'),
]

export const taskIdValidator = [param('id').isMongoId().withMessage('Invalid task id')]

export const bulkTaskValidator = [
  body('ids').isArray({ min: 1, max: 50 }).withMessage('Select between 1 and 50 tasks'),
  body('ids.*').isMongoId().withMessage('Invalid task id'),
  body('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status'),
  body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee'),
]
