import mongoose, { Schema } from 'mongoose'

const commentSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null, index: true },
    specId: { type: Schema.Types.ObjectId, ref: 'Spec', default: null, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    mentions: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true },
)

commentSchema.pre('validate', function ensureParent(next) {
  const hasTask = Boolean(this.taskId)
  const hasSpec = Boolean(this.specId)
  if (hasTask === hasSpec) {
    next(new Error('Comment must reference exactly one of taskId or specId'))
    return
  }
  next()
})

export const Comment = mongoose.model('Comment', commentSchema)
