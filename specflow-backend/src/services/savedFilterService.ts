import { SavedFilter } from '../models/SavedFilter'
import type { Actor } from '../types/api.types'
import { AppError } from '../utils/AppError'
import { mapId } from '../utils/mappers'

export interface FilterQuery {
  status?: string
  priority?: string
  assignedTo?: string
  q?: string
  due?: string
}

export interface SavedFilterDto {
  id: string
  name: string
  resource: 'tasks'
  query: FilterQuery
  createdAt: string
}

function toDto(doc: {
  id?: string
  _id: unknown
  name: string
  resource: 'tasks'
  query: FilterQuery
  createdAt?: Date
}): SavedFilterDto {
  return {
    id: doc.id ?? String(doc._id),
    name: doc.name,
    resource: doc.resource,
    query: {
      status: doc.query.status ?? '',
      priority: doc.query.priority ?? '',
      assignedTo: doc.query.assignedTo ?? '',
      q: doc.query.q ?? '',
      due: doc.query.due ?? '',
    },
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  }
}

export async function listSavedFilters(actor: Actor): Promise<SavedFilterDto[]> {
  const docs = await SavedFilter.find({ userId: actor.id, resource: 'tasks' }).sort({ name: 1 })
  return docs.map((doc) => toDto(doc))
}

export async function createSavedFilter(
  actor: Actor,
  name: string,
  query: FilterQuery,
): Promise<SavedFilterDto> {
  const trimmed = name.trim()
  if (!trimmed) throw new AppError('Name is required', 400)
  try {
    const created = await SavedFilter.create({
      userId: actor.id,
      name: trimmed,
      resource: 'tasks',
      query,
    })
    return toDto(created)
  } catch {
    throw new AppError('A filter with that name already exists', 409)
  }
}

export async function deleteSavedFilter(id: string, actor: Actor): Promise<void> {
  const doc = await SavedFilter.findById(id)
  if (!doc) throw new AppError('Filter not found', 404)
  if (mapId(doc.userId) !== actor.id) throw new AppError('Forbidden', 403)
  await doc.deleteOne()
}
