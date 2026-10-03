import { body, param } from 'express-validator'

export const listCommentsValidator = [param('id').isMongoId().withMessage('Invalid task id')]

export const createCommentValidator = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Comment body is required')
    .isLength({ max: 2000 })
    .withMessage('Comment must be at most 2000 characters'),
]

export const deleteCommentValidator = [
  param('id').isMongoId().withMessage('Invalid task id'),
  param('commentId').isMongoId().withMessage('Invalid comment id'),
]
