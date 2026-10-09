import { Spec } from '../models/Spec'
import { Task } from '../models/Task'
import { escapeRegex } from '../utils/pagination'

const LIMIT = 10

export interface SearchHit {
  id: string
  title: string
  kind: 'task' | 'spec'
}

export async function searchAll(q: string): Promise<{ tasks: SearchHit[]; specs: SearchHit[] }> {
  const trimmed = q.trim()
  if (!trimmed) return { tasks: [], specs: [] }
  const pattern = { $regex: escapeRegex(trimmed), $options: 'i' }
  const [tasks, specs] = await Promise.all([
    Task.find({
      $or: [{ title: pattern }, { description: pattern }, { tags: pattern }],
    })
      .sort({ updatedAt: -1 })
      .limit(LIMIT)
      .select('title'),
    Spec.find({
      archivedAt: null,
      $or: [
        { title: pattern },
        { businessGoal: pattern },
        { technicalApproach: pattern },
        { acceptanceCriteria: pattern },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(LIMIT)
      .select('title'),
  ])
  return {
    tasks: tasks.map((doc) => ({ id: doc.id, title: doc.title, kind: 'task' as const })),
    specs: specs.map((doc) => ({ id: doc.id, title: doc.title, kind: 'spec' as const })),
  }
}
