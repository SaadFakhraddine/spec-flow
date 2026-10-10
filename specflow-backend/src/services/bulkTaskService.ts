import { Task } from '../models/Task'
import type { Actor, TaskStatus } from '../types/api.types'
import { assertAdmin } from '../utils/actor'
import { AppError } from '../utils/AppError'
import { isTaskStatus, mapId } from '../utils/mappers'
import { recordActivity } from './activityService'
import { notifyAssignment, notifyStatusWatchers } from './notificationService'

interface BulkInput {
  ids: string[]
  status?: TaskStatus
  assignedTo?: string | null
}

export async function bulkUpdateTasks(input: BulkInput, actor: Actor): Promise<{ updated: number }> {
  if (!input.ids.length) throw new AppError('Select at least one task', 400)
  if (!input.status && input.assignedTo === undefined) {
    throw new AppError('Provide status or assignedTo', 400)
  }
  if (input.assignedTo !== undefined) assertAdmin(actor)
  if (input.status && !isTaskStatus(input.status)) throw new AppError('Invalid status', 400)

  let updated = 0
  for (const id of input.ids) {
    const task = await Task.findById(id)
    if (!task) continue
    if (actor.role !== 'admin' && mapId(task.assignedTo) !== actor.id) {
      throw new AppError('You can only bulk-update tasks assigned to you', 403)
    }
    if (input.status && input.status !== task.status) {
      const previous = task.status
      task.status = input.status
      await task.save()
      await recordActivity({
        actorId: actor.id,
        type: 'task.status',
        taskId: task.id,
        meta: { from: previous, to: input.status },
      })
      await notifyStatusWatchers(task.id, actor.id, previous, input.status)
      updated += 1
    }
    if (input.assignedTo !== undefined) {
      task.set('assignedTo', input.assignedTo)
      await task.save()
      await recordActivity({
        actorId: actor.id,
        type: 'task.assigned',
        taskId: task.id,
        meta: { userId: input.assignedTo },
      })
      if (input.assignedTo) {
        await notifyAssignment(task.id, input.assignedTo, actor.id, task.title)
      }
      updated += 1
    }
  }
  return { updated }
}
