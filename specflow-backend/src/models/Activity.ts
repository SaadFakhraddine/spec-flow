import mongoose, { Schema } from 'mongoose'

const ACTIVITY_TYPES = [
  'task.created',
  'task.status',
  'task.assigned',
  'comment.created',
  'spec.status',
] as const

const activitySchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null, index: true },
    specId: { type: Schema.Types.ObjectId, ref: 'Spec', default: null, index: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const Activity = mongoose.model('Activity', activitySchema)
export type ActivityType = (typeof ACTIVITY_TYPES)[number]
