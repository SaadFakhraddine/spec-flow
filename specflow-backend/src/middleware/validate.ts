import type { NextFunction, Request, Response } from 'express'
import { validationResult, type ValidationChain } from 'express-validator'
import { AppError } from '../utils/AppError'

export function validate(chains: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((chain) => chain.run(req)))
    const result = validationResult(req)
    if (result.isEmpty()) {
      next()
      return
    }
    const errors = result.array().map((item) => String(item.msg))
    next(new AppError('Validation failed', 400, errors))
  }
}
