import { User } from '../models/User'
import type { UserRef } from '../types/api.types'
import { mapId } from '../utils/mappers'

interface MentionUser {
  id: string
  name: string
  email: string
  local: string
  nameKey: string
  first: string
}

function toMentionUser(doc: { id?: string; _id: unknown; name: string; email: string }): MentionUser {
  const id = doc.id ?? String(doc._id)
  const local = doc.email.split('@')[0]?.toLowerCase() ?? ''
  const nameKey = doc.name.toLowerCase().replace(/\s+/g, '')
  const first = doc.name.toLowerCase().split(/\s+/)[0] ?? ''
  return { id, name: doc.name, email: doc.email, local, nameKey, first }
}

function matchToken(token: string, users: MentionUser[]): MentionUser | undefined {
  const raw = token.toLowerCase()
  return (
    users.find((user) => user.local === raw) ||
    users.find((user) => user.nameKey === raw) ||
    users.find((user) => user.first === raw)
  )
}

export async function resolveMentions(body: string): Promise<string[]> {
  const tokens = body.match(/@([a-zA-Z0-9._-]+)/g)
  if (!tokens?.length) return []
  const docs = await User.find().select('name email')
  const users = docs.map((doc) => toMentionUser(doc))
  const ids = new Set<string>()
  for (const token of tokens) {
    const match = matchToken(token.slice(1), users)
    if (match) ids.add(match.id)
  }
  return [...ids]
}

export async function listMentionable(): Promise<UserRef[]> {
  const docs = await User.find().select('name email').sort({ name: 1 }).limit(100)
  return docs.map((doc) => ({
    id: mapId(doc._id) ?? doc.id,
    name: doc.name,
    email: doc.email,
  }))
}
