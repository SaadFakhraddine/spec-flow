import { Spec } from '../models/Spec'
import { Task } from '../models/Task'
import type { Actor, Page, SpecDto, SpecInput, TaskDto } from '../types/api.types'
import { assertAdmin } from '../utils/actor'
import { AppError } from '../utils/AppError'
import { mapSpecSource, mapTaskSource } from '../utils/mappers'

const USER_FIELDS = 'name email'

async function loadSpec(id: string) {
  const spec = await Spec.findById(id).populate('createdBy', USER_FIELDS).populate({
    path: 'tasks',
    populate: [
      { path: 'assignedTo', select: USER_FIELDS },
      { path: 'createdBy', select: USER_FIELDS },
    ],
  })
  if (!spec) throw new AppError('Spec not found', 404)
  return spec
}

function toDto(spec: unknown, tasks: unknown[]): SpecDto {
  return mapSpecSource(spec, tasks.map((task) => mapTaskSource(task)))
}

export async function getSpecs(pageQuery: Page) {
  const { page, limit } = pageQuery
  const skip = (page - 1) * limit
  const [docs, total] = await Promise.all([
    Spec.find().sort({ updatedAt: -1 }).skip(skip).limit(limit).populate('createdBy', USER_FIELDS),
    Spec.countDocuments(),
  ])
  return { data: docs.map((doc) => toDto(doc, [])), total, page, limit }
}

export async function getSpecById(id: string): Promise<SpecDto> {
  const spec = await loadSpec(id)
  return toDto(spec, spec.tasks)
}

export async function createSpec(input: SpecInput, actor: Actor): Promise<SpecDto> {
  assertAdmin(actor)
  const spec = await Spec.create({ ...input, createdBy: actor.id, tasks: [] })
  return getSpecById(spec.id)
}

export async function updateSpec(id: string, input: Partial<SpecInput>, actor: Actor): Promise<SpecDto> {
  assertAdmin(actor)
  const spec = await Spec.findById(id)
  if (!spec) throw new AppError('Spec not found', 404)
  spec.set(input)
  await spec.save()
  return getSpecById(spec.id)
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
