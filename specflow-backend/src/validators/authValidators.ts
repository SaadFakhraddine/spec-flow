import { body } from 'express-validator'
import { ACCENT_PREFS, DENSITY_PREFS, THEME_PREFS } from '../types/api.types'

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

export const preferencesValidator = [
  body('theme').optional().isIn(THEME_PREFS).withMessage('Invalid theme'),
  body('accent').optional().isIn(ACCENT_PREFS).withMessage('Invalid accent'),
  body('density').optional().isIn(DENSITY_PREFS).withMessage('Invalid density'),
]
