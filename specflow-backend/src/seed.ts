import { connectDb, disconnectDb } from './config/db'
import { logger } from './config/logger'
import { Comment } from './models/Comment'
import { Spec } from './models/Spec'
import { Task } from './models/Task'
import { User } from './models/User'
import { SEED_ACCOUNTS, buildSeedPayload } from './seedData'

async function ensureUsers() {
  const created = []
  for (const account of SEED_ACCOUNTS) {
    const existing = await User.findOne({ email: account.email })
    created.push(existing ?? (await User.create(account)))
  }
  return { admin: created[0], developer: created[1] }
}

async function ensureSample(adminId: string, developerId: string): Promise<void> {
  if ((await Task.countDocuments()) > 0) return
  const payload = buildSeedPayload(adminId, developerId)
  const specs = await Spec.create(payload.specs)
  const taskDocs = await Task.create(
    payload.tasks.map((task) => {
      const { specIndex, ...fields } = task
      const spec = specs[specIndex]
      return { ...fields, specId: spec?.id ?? null }
    }),
  )
  for (let index = 0; index < specs.length; index += 1) {
    const spec = specs[index]
    if (!spec) continue
    spec.tasks = taskDocs
      .filter((task) => task.specId && String(task.specId) === String(spec._id))
      .map((task) => task._id)
    await spec.save()
  }
  await writeComments(
    adminId,
    developerId,
    taskDocs.map((task) => ({ id: String(task._id), title: task.title })),
    payload.comments,
  )
}

async function writeComments(
  adminId: string,
  developerId: string,
  tasks: { id: string; title: string }[],
  comments: ReturnType<typeof buildSeedPayload>['comments'],
): Promise<void> {
  const byTitle = new Map(tasks.map((task) => [task.title, task.id]))
  const docs = comments.flatMap((comment) => {
    const taskId = byTitle.get(comment.taskTitle)
    if (!taskId) return []
    return [{
      taskId,
      authorId: comment.author === 'admin' ? adminId : developerId,
      body: comment.body,
    }]
  })
  if (docs.length > 0) await Comment.create(docs)
}

async function ensureComments(adminId: string, developerId: string): Promise<void> {
  if ((await Comment.countDocuments()) > 0) return
  const tasks = await Task.find().select('title')
  const payload = buildSeedPayload(adminId, developerId)
  await writeComments(adminId, developerId, tasks.map((task) => ({ id: task.id, title: task.title })), payload.comments)
}

async function seed(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    throw new Error('Refusing to seed in production without ALLOW_SEED=true')
  }
  await connectDb()
  const users = await ensureUsers()
  if (!users.admin || !users.developer) throw new Error('Seed users were not created')
  await ensureSample(users.admin.id, users.developer.id)
  await ensureComments(users.admin.id, users.developer.id)
  logger.info('Seed complete')
  await disconnectDb()
}

seed().catch((error: unknown) => {
  logger.error('Seed failed', { message: error instanceof Error ? error.message : 'unknown' })
  process.exit(1)
})
