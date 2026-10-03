import mongoose, { Schema } from 'mongoose'

const tagsValidator = {
  validator: (tags: string[]) => tags.length <= 5 && tags.every((tag) => tag.length <= 20),
  message: 'Use at most 5 tags, each at most 20 characters',
}

const taskSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: ['backlog', 'in-progress', 'in-review', 'done'],
      default: 'backlog',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    specId: { type: Schema.Types.ObjectId, ref: 'Spec', default: null },
    tags: { type: [String], default: [], validate: tagsValidator },
    dueDate: { type: Date, default: null },
    watchers: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true },
)

export const Task = mongoose.model('Task', taskSchema)
