import { body } from 'express-validator'

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must include a number')
    .matches(/[A-Z]/)
    .withMessage('Password must include an uppercase letter'),
]

export const loginValidator = [
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]
