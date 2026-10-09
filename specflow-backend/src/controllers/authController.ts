import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import * as authService from '../services/authService'
import type { PreferencesPatch } from '../utils/preferences'
import { AppError } from '../utils/AppError'
import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from '../utils/cookies'
import { sendData } from '../utils/http'

interface RegisterBody {
  name: string
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!env.ALLOW_PUBLIC_REGISTER) {
      throw new AppError('Public registration is disabled', 403)
    }
    const body = req.body as RegisterBody
    const result = await authService.register(body.name, body.email, body.password, 'developer')
    setRefreshCookie(res, result.refreshToken)
    sendData(res, { accessToken: result.accessToken, user: result.user }, 201)
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as LoginBody
    const result = await authService.login(body.email, body.password)
    setRefreshCookie(res, result.refreshToken)
    sendData(res, { accessToken: result.accessToken, user: result.user })
  } catch (error) {
    next(error)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token missing' })
      return
    }
    const result = await authService.refresh(token)
    setRefreshCookie(res, result.refreshToken)
    sendData(res, { accessToken: result.accessToken })
  } catch (error) {
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    await authService.logout(token)
    clearRefreshCookie(res)
    sendData(res, null)
  } catch (error) {
    next(error)
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user?.id ?? '')
    sendData(res, user)
  } catch (error) {
    next(error)
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as PreferencesPatch
    const user = await authService.updatePreferences(req.user?.id ?? '', body)
    sendData(res, user)
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const name = String((req.body as { name: string }).name)
    const user = await authService.updateProfile(req.user?.id ?? '', name)
    sendData(res, user)
  } catch (error) {
    next(error)
  }
}
