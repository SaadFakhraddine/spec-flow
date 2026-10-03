import mongoose, { Schema } from 'mongoose'

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['task.assigned', 'comment.created'], required: true },
    message: { type: String, required: true, maxlength: 300 },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)
