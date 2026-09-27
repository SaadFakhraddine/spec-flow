import { User, type UserDocument } from '../models/User'
import type { PublicUser, Role } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: PublicUser
}

function toPublic(user: UserDocument): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function issue(user: UserDocument): AuthResult {
  return {
    accessToken: generateAccessToken(user.id, user.role),
    refreshToken: generateRefreshToken(user.id, user.tokenVersion),
    user: toPublic(user),
  }
}

export async function register(name: string, email: string, password: string, role: Role = 'developer'): Promise<AuthResult> {
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) throw new AppError('Email already registered', 409)
  const user = await User.create({ name, email, password, role })
  return issue(user)
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +tokenVersion')
  if (!user) throw new AppError('Invalid email or password', 401)
  const matches = await user.comparePassword(password)
  if (!matches) throw new AppError('Invalid email or password', 401)
  return issue(user)
}

export async function refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(token)
  const user = await User.findById(payload.sub).select('+tokenVersion')
  if (!user || user.tokenVersion !== payload.tv) throw new AppError('Invalid or expired token', 401)
  user.tokenVersion += 1
  await user.save()
  return {
    accessToken: generateAccessToken(user.id, user.role),
    refreshToken: generateRefreshToken(user.id, user.tokenVersion),
  }
}

export async function logout(token: string | undefined): Promise<void> {
  if (!token) return
  try {
    const payload = verifyRefreshToken(token)
    await User.findByIdAndUpdate(payload.sub, { $inc: { tokenVersion: 1 } })
  } catch (error) {
    if (!(error instanceof AppError)) throw error
  }
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404)
  return toPublic(user)
}

export async function listUsers(): Promise<PublicUser[]> {
  const users = await User.find().sort({ name: 1 })
  return users.map((user) => toPublic(user))
}
