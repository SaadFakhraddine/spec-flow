import mongoose, { Schema } from 'mongoose'

const querySchema = new Schema(
  {
    status: { type: String, default: '' },
    priority: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    q: { type: String, default: '' },
    due: { type: String, default: '' },
  },
  { _id: false },
)

const savedFilterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    resource: { type: String, enum: ['tasks'], default: 'tasks', required: true },
    query: { type: querySchema, required: true },
  },
  { timestamps: true },
)

savedFilterSchema.index({ userId: 1, name: 1 }, { unique: true })

export const SavedFilter = mongoose.model('SavedFilter', savedFilterSchema)
