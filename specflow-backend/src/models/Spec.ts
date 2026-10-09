import mongoose, { Schema } from 'mongoose'

const criteriaValidator = {
  validator: (items: string[]) => items.length >= 1,
  message: 'At least one acceptance criterion is required',
}

const specSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 150, trim: true },
    businessGoal: { type: String, required: true, maxlength: 1000 },
    technicalApproach: { type: String, required: true, maxlength: 5000 },
    apiDesign: { type: String, maxlength: 3000, default: '' },
    edgeCases: { type: [String], default: [] },
    acceptanceCriteria: { type: [String], required: true, validate: criteriaValidator },
    regressionRisks: { type: String, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['draft', 'ready', 'in-review', 'approved'],
      default: 'draft',
    },
    archivedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true },
)

export const Spec = mongoose.model('Spec', specSchema)
