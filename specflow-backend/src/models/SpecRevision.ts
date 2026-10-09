import mongoose, { Schema } from 'mongoose'

const revisionSchema = new Schema(
  {
    specId: { type: Schema.Types.ObjectId, ref: 'Spec', required: true, index: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    businessGoal: { type: String, required: true },
    technicalApproach: { type: String, required: true },
    apiDesign: { type: String, default: '' },
    edgeCases: { type: [String], default: [] },
    acceptanceCriteria: { type: [String], required: true },
    regressionRisks: { type: String, default: '' },
    status: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

revisionSchema.index({ specId: 1, version: 1 }, { unique: true })

export const SpecRevision = mongoose.model('SpecRevision', revisionSchema)
