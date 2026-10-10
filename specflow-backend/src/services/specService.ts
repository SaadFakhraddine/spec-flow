import { Spec } from '../models/Spec'
import { SpecRevision } from '../models/SpecRevision'
import { Task } from '../models/Task'
import type {
  Actor,
  Page,
  SpecDto,
  SpecInput,
  SpecRevisionDto,
  SpecStatus,
} from '../types/api.types'
import { assertAdmin } from '../utils/actor'
import { AppError } from '../utils/AppError'
import { rowsToCsv } from '../utils/csv'
import { mapSpecRevision, mapSpecSource, mapTaskSource } from '../utils/mappers'
import { escapeRegex } from '../utils/pagination'
import { assertSpecTransition } from '../utils/specTransitions'
import { recordActivity } from './activityService'

const USER_FIELDS = 'name email'
const EXPORT_CAP = 500

export interface SpecListFilters {
  status?: string
  q?: string
  includeArchived?: boolean
  archivedOnly?: boolean
}

async function loadSpec(id: string) {
  const spec = await Spec.findById(id)
    .populate('createdBy', USER_FIELDS)
    .populate('approvedBy', USER_FIELDS)
    .populate({
      path: 'tasks',
      populate: [
        { path: 'assignedTo', select: USER_FIELDS },
        { path: 'createdBy', select: USER_FIELDS },
        { path: 'blockedBy', select: 'title' },
      ],
    })
  if (!spec) throw new AppError('Spec not found', 404)
  return spec
}

function toDto(spec: unknown, tasks: unknown[]): SpecDto {
  return mapSpecSource(
    spec,
    tasks.map((task) => mapTaskSource(task)),
  )
}

function buildListQuery(filters: SpecListFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {}
  if (filters.status) query.status = filters.status
  if (filters.archivedOnly) query.archivedAt = { $ne: null }
  else if (!filters.includeArchived) query.archivedAt = null
  if (filters.q) {
    const pattern = { $regex: escapeRegex(filters.q), $options: 'i' }
    query.$or = [
      { title: pattern },
      { businessGoal: pattern },
      { technicalApproach: pattern },
      { acceptanceCriteria: pattern },
    ]
  }
  return query
}

export async function getSpecs(pageQuery: Page, filters: SpecListFilters = {}) {
  const { page, limit } = pageQuery
  const skip = (page - 1) * limit
  const query = buildListQuery(filters)
  const [docs, total] = await Promise.all([
    Spec.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', USER_FIELDS)
      .populate('approvedBy', USER_FIELDS),
    Spec.countDocuments(query),
  ])
  return { data: docs.map((doc) => toDto(doc, [])), total, page, limit }
}

export async function getSpecById(id: string): Promise<SpecDto> {
  const spec = await loadSpec(id)
  return toDto(spec, spec.tasks)
}

function pickSpecFields(input: Partial<SpecInput>): Partial<SpecInput> {
  const fields: Partial<SpecInput> = {}
  if (input.title !== undefined) fields.title = input.title
  if (input.businessGoal !== undefined) fields.businessGoal = input.businessGoal
  if (input.technicalApproach !== undefined) fields.technicalApproach = input.technicalApproach
  if (input.apiDesign !== undefined) fields.apiDesign = input.apiDesign
  if (input.edgeCases !== undefined) fields.edgeCases = input.edgeCases
  if (input.acceptanceCriteria !== undefined) fields.acceptanceCriteria = input.acceptanceCriteria
  if (input.regressionRisks !== undefined) fields.regressionRisks = input.regressionRisks
  if (input.status !== undefined) fields.status = input.status
  return fields
}

export async function createSpec(input: SpecInput, actor: Actor): Promise<SpecDto> {
  assertAdmin(actor)
  const fields = pickSpecFields(input)
  const spec = await Spec.create({
    title: fields.title,
    businessGoal: fields.businessGoal,
    technicalApproach: fields.technicalApproach,
    apiDesign: fields.apiDesign ?? '',
    edgeCases: fields.edgeCases ?? [],
    acceptanceCriteria: fields.acceptanceCriteria,
    regressionRisks: fields.regressionRisks ?? '',
    /** Always start as draft; approval goes through updateSpec transitions. */
    status: 'draft',
    createdBy: actor.id,
    tasks: [],
    archivedAt: null,
    approvedAt: null,
    approvedBy: null,
  })
  return getSpecById(spec.id)
}

async function snapshotRevision(
  spec: {
    _id: unknown
    id?: string
    title: string
    businessGoal: string
    technicalApproach: string
    apiDesign?: string
    edgeCases?: string[]
    acceptanceCriteria: string[]
    regressionRisks?: string
    status: SpecStatus
  },
  actorId: string,
): Promise<void> {
  const specId = spec.id ?? String(spec._id)
  const latest = await SpecRevision.findOne({ specId }).sort({ version: -1 }).select('version')
  const version = (latest?.version ?? 0) + 1
  await SpecRevision.create({
    specId,
    version,
    title: spec.title,
    businessGoal: spec.businessGoal,
    technicalApproach: spec.technicalApproach,
    apiDesign: spec.apiDesign ?? '',
    edgeCases: spec.edgeCases ?? [],
    acceptanceCriteria: spec.acceptanceCriteria,
    regressionRisks: spec.regressionRisks ?? '',
    status: spec.status,
    createdBy: actorId,
  })
}

export async function updateSpec(
  id: string,
  input: Partial<SpecInput>,
  actor: Actor,
): Promise<SpecDto> {
  assertAdmin(actor)
  const spec = await Spec.findById(id)
  if (!spec) throw new AppError('Spec not found', 404)
  const previousStatus = spec.status as SpecStatus
  const fields = pickSpecFields(input)
  if (fields.status && fields.status !== previousStatus) {
    try {
      assertSpecTransition(previousStatus, fields.status)
    } catch (error) {
      throw new AppError(error instanceof Error ? error.message : 'Invalid status transition', 400)
    }
  }
  spec.set(fields)
  if (fields.status === 'approved' && previousStatus !== 'approved') {
    spec.approvedAt = new Date()
    spec.approvedBy = actor.id as unknown as typeof spec.approvedBy
    await snapshotRevision(spec, actor.id)
  }
  await spec.save()
  if (fields.status && fields.status !== previousStatus) {
    await recordActivity({
      actorId: actor.id,
      type: 'spec.status',
      specId: spec.id,
      meta: { from: previousStatus, to: fields.status, title: spec.title },
    })
  }
  return getSpecById(spec.id)
}

export async function setArchived(id: string, archived: boolean, actor: Actor): Promise<SpecDto> {
  assertAdmin(actor)
  const spec = await Spec.findById(id)
  if (!spec) throw new AppError('Spec not found', 404)
  spec.archivedAt = archived ? new Date() : null
  await spec.save()
  return getSpecById(spec.id)
}

export async function deleteSpec(id: string, actor: Actor): Promise<void> {
  assertAdmin(actor)
  const spec = await Spec.findById(id)
  if (!spec) throw new AppError('Spec not found', 404)
  await Task.updateMany({ specId: spec._id }, { $set: { specId: null } })
  await SpecRevision.deleteMany({ specId: spec._id })
  await spec.deleteOne()
}

export async function listRevisions(id: string): Promise<SpecRevisionDto[]> {
  const exists = await Spec.exists({ _id: id })
  if (!exists) throw new AppError('Spec not found', 404)
  const docs = await SpecRevision.find({ specId: id })
    .sort({ version: -1 })
    .populate('createdBy', USER_FIELDS)
  return docs.map((doc) => mapSpecRevision(doc))
}

export async function exportSpecsCsv(filters: SpecListFilters): Promise<string> {
  const query = buildListQuery(filters)
  const docs = await Spec.find(query)
    .sort({ updatedAt: -1 })
    .limit(EXPORT_CAP)
    .populate('createdBy', USER_FIELDS)
  const headers = [
    'id',
    'title',
    'status',
    'archived',
    'createdBy',
    'taskCount',
    'createdAt',
    'updatedAt',
  ]
  const rows = docs.map((doc) => [
    doc.id,
    doc.title,
    doc.status,
    doc.archivedAt ? 'yes' : 'no',
    (doc.createdBy as { name?: string })?.name ?? '',
    String(doc.tasks?.length ?? 0),
    doc.createdAt?.toISOString?.() ?? '',
    doc.updatedAt?.toISOString?.() ?? '',
  ])
  return rowsToCsv(headers, rows)
}

async function moveTask(taskId: unknown, previousSpecId: unknown, nextSpecId: string): Promise<void> {
  if (previousSpecId && String(previousSpecId) !== nextSpecId) {
    await Spec.findByIdAndUpdate(previousSpecId, { $pull: { tasks: taskId } })
  }
  await Spec.findByIdAndUpdate(nextSpecId, { $addToSet: { tasks: taskId } })
}

export async function addTaskToSpec(specId: string, taskId: string, actor: Actor): Promise<SpecDto> {
  assertAdmin(actor)
  const spec = await Spec.findById(specId)
  if (!spec) throw new AppError('Spec not found', 404)
  const task = await Task.findById(taskId)
  if (!task) throw new AppError('Task not found', 404)
  await moveTask(task._id, task.specId, specId)
  task.set('specId', spec._id)
  await task.save()
  return getSpecById(specId)
}
