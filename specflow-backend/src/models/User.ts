import bcrypt from 'bcrypt'
import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose'
import type { Role, UserPreferences } from '../types/api.types'
import { DEFAULT_PREFERENCES } from '../types/api.types'

export interface IUser {
  email: string
  password: string
  name: string
  role: Role
  tokenVersion: number
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>
type UserModel = Model<IUser, object, IUserMethods>

const notificationPrefsSchema = new Schema(
  {
    taskAssigned: { type: Boolean, default: true },
    commentCreated: { type: Boolean, default: true },
    mentionCreated: { type: Boolean, default: true },
    taskStatus: { type: Boolean, default: true },
  },
  { _id: false },
)

const defaultPrefsSchema = new Schema(
  {
    tasksView: { type: String, enum: ['list', 'board'], default: 'list' },
    landingPage: {
      type: String,
      enum: ['dashboard', 'my-work', 'tasks'],
      default: 'dashboard',
    },
    tasksScope: { type: String, enum: ['all', 'mine'], default: 'all' },
  },
  { _id: false },
)

const preferencesSchema = new Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    accent: { type: String, enum: ['teal', 'amber', 'slate'], default: 'teal' },
    density: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
    notifications: {
      type: notificationPrefsSchema,
      default: () => ({ ...DEFAULT_PREFERENCES.notifications }),
    },
    defaults: {
      type: defaultPrefsSchema,
      default: () => ({ ...DEFAULT_PREFERENCES.defaults }),
    },
  },
  { _id: false },
)

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'developer'], default: 'developer' },
    tokenVersion: { type: Number, default: 0, select: false },
    preferences: {
      type: preferencesSchema,
      default: () => ({
        ...DEFAULT_PREFERENCES,
        notifications: { ...DEFAULT_PREFERENCES.notifications },
        defaults: { ...DEFAULT_PREFERENCES.defaults },
      }),
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model<IUser, UserModel>('User', userSchema)
