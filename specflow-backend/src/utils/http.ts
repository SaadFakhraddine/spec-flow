import type { Response } from 'express'

export function sendData<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data })
}

export function sendPage<T>(res: Response, data: T[], total: number, page: number, limit: number): void {
  res.status(200).json({ success: true, data, total, page, limit })
}
