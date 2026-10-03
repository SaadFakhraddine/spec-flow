import { Task } from '../models/Task'
import type { Actor, TaskDto } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { mapTaskSource } from '../utils/mappers'

const USER_FIELDS = 'name email'

async function loadTask(id: string, actor: Actor): Promise<TaskDto> {
  const task = await Task.findById(id)
    .populate('assignedTo', USER_FIELDS)
    .populate('createdBy', USER_FIELDS)
  if (!task) throw new AppError('Task not found', 404)
  return mapTaskSource(task, actor.id)
}

export async function watchTask(id: string, actor: Actor): Promise<TaskDto> {
  const updated = await Task.findByIdAndUpdate(
    id,
    { $addToSet: { watchers: actor.id } },
    { new: true },
  )
  if (!updated) throw new AppError('Task not found', 404)
  return loadTask(id, actor)
}

export async function unwatchTask(id: string, actor: Actor): Promise<TaskDto> {
  const updated = await Task.findByIdAndUpdate(
    id,
    { $pull: { watchers: actor.id } },
    { new: true },
  )
  if (!updated) throw new AppError('Task not found', 404)
  return loadTask(id, actor)
}
