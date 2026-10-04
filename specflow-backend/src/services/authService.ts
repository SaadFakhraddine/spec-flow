import { User, type UserDocument } from '../models/User'
import type { PublicUser, Role, UserPreferences } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { escapeRegex } from '../utils/pagination'
import { mergePreferences, normalizePreferences, type PreferencesPatch } from '../utils/preferences'

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: PublicUser
}

function prefsOf(user: UserDocument): UserPreferences {
  return normalizePreferences(user.preferences)
}

function toPublic(user: UserDocument): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: prefsOf(user),
  }
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

export async function updateProfile(userId: string, name: string): Promise<PublicUser> {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404)
  user.name = name.trim()
  await user.save()
  return toPublic(user)
}

export async function updatePreferences(userId: string, patch: PreferencesPatch): Promise<PublicUser> {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404)
  user.preferences = mergePreferences(prefsOf(user), patch) as UserDocument['preferences']
  user.markModified('preferences')
  await user.save()
  return toPublic(user)
}

export async function listUsers(q?: string, limit = 50): Promise<PublicUser[]> {
  const filter: Record<string, unknown> = {}
  if (q?.trim()) {
    const pattern = escapeRegex(q.trim())
    filter.$or = [
      { name: { $regex: pattern, $options: 'i' } },
      { email: { $regex: pattern, $options: 'i' } },
    ]
  }
  const users = await User.find(filter).sort({ name: 1 }).limit(Math.min(limit, 100))
  return users.map((user) => toPublic(user))
}
