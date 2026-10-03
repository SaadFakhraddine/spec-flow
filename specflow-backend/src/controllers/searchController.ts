import type { NextFunction, Request, Response } from 'express'
import { searchAll } from '../services/searchService'
import { readText } from '../utils/pagination'
import { sendData } from '../utils/http'

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendData(res, await searchAll(readText(req.query.q) ?? ''))
  } catch (error) {
    next(error)
  }
}
