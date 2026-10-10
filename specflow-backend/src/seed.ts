import { connectDb, disconnectDb } from './config/db'
import { logger } from './config/logger'
import { Activity } from './models/Activity'
import { Comment } from './models/Comment'
import { Notification } from './models/Notification'
import { SavedFilter } from './models/SavedFilter'
import { Spec } from './models/Spec'
import { SpecRevision } from './models/SpecRevision'
import { Task } from './models/Task'
import { User } from './models/User'
import { SEED_ACCOUNTS, buildSeedPayload } from './seedData'

type SeedPayload = ReturnType<typeof buildSeedPayload>

async function clearDemoData(): Promise<void> {
  await Promise.all([
    Task.deleteMany({}),
    Spec.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    Activity.deleteMany({}),
    SpecRevision.deleteMany({}),
    SavedFilter.deleteMany({}),
  ])
  logger.info('Cleared previous demo collections (SEED_FORCE)')
}

async function ensureUsers() {
  const created = []
  for (const account of SEED_ACCOUNTS) {
    const existing = await User.findOne({ email: account.email }).select('+password')
    if (existing) {
      existing.name = account.name
      existing.role = account.role
      existing.preferences = account.preferences as typeof existing.preferences
      existing.markModified('preferences')
      // Only reset password when forcing a full reseed — avoids unexpected lockouts.
      if (process.env.SEED_FORCE === 'true') {
        existing.password = account.password
      }
      await existing.save()
      created.push(existing)
    } else {
      created.push(await User.create(account))
    }
  }
  return { admin: created[0], developer: created[1] }
}

async function writeTasks(
  specs: InstanceType<typeof Spec>[],
  payload: SeedPayload,
): Promise<InstanceType<typeof Task>[]> {
  const created = await Task.create(
    payload.tasks.map((task) => {
      const { specIndex, blockedByTitles: _blocked, ...fields } = task
      const spec = specs[specIndex]
      return { ...fields, specId: spec?.id ?? null, blockedBy: [] }
    }),
  )

  const byTitle = new Map(created.map((task) => [task.title, task]))
  for (const seed of payload.tasks) {
    if (!seed.blockedByTitles.length) continue
    const task = byTitle.get(seed.title)
    if (!task) continue
    task.blockedBy = seed.blockedByTitles
      .map((title) => byTitle.get(title)?._id)
      .filter((id): id is NonNullable<typeof id> => Boolean(id))
    await task.save()
  }

  for (let index = 0; index < specs.length; index += 1) {
    const spec = specs[index]
    if (!spec) continue
    spec.tasks = created
      .filter((task) => task.specId && String(task.specId) === String(spec._id))
      .map((task) => task._id)
    await spec.save()
  }

  return created
}

async function writeComments(
  adminId: string,
  developerId: string,
  tasks: { id: string; title: string }[],
  specs: { id: string; title: string }[],
  comments: SeedPayload['comments'],
): Promise<void> {
  const tasksByTitle = new Map(tasks.map((task) => [task.title, task.id]))
  const specsByTitle = new Map(specs.map((spec) => [spec.title, spec.id]))
  const docs: Array<{
    taskId?: string
    specId?: string
    authorId: string
    body: string
    mentions: string[]
  }> = []
  for (const comment of comments) {
    const authorId = comment.author === 'admin' ? adminId : developerId
    const mentionId =
      comment.mention === 'admin' ? adminId : comment.mention === 'developer' ? developerId : null
    const mentions = mentionId ? [mentionId] : []
    if (comment.parent === 'task') {
      const taskId = tasksByTitle.get(comment.title)
      if (taskId) docs.push({ taskId, authorId, body: comment.body, mentions })
      continue
    }
    const specId = specsByTitle.get(comment.title)
    if (specId) docs.push({ specId, authorId, body: comment.body, mentions })
  }
  if (docs.length > 0) await Comment.create(docs)
}

async function writeRevisions(
  specs: { id: string; title: string }[],
  revisions: SeedPayload['revisions'],
): Promise<void> {
  const byTitle = new Map(specs.map((spec) => [spec.title, spec.id]))
  const docs = revisions.flatMap((revision) => {
    const specId = byTitle.get(revision.specTitle)
    if (!specId) return []
    return [{
      specId,
      version: revision.version,
      title: revision.title,
      businessGoal: revision.businessGoal,
      technicalApproach: revision.technicalApproach,
      apiDesign: revision.apiDesign,
      edgeCases: revision.edgeCases,
      acceptanceCriteria: revision.acceptanceCriteria,
      regressionRisks: revision.regressionRisks,
      status: revision.status,
      createdBy: revision.createdBy,
    }]
  })
  if (docs.length > 0) await SpecRevision.create(docs)
}

async function writeNotifications(
  adminId: string,
  developerId: string,
  tasks: { id: string; title: string }[],
  notifications: SeedPayload['notifications'],
): Promise<void> {
  const byTitle = new Map(tasks.map((task) => [task.title, task.id]))
  const docs = notifications.flatMap((item) => {
    const taskId = byTitle.get(item.taskTitle)
    if (!taskId) return []
    return [{
      userId: item.user === 'admin' ? adminId : developerId,
      type: item.type,
      message: item.message,
      taskId,
      readAt: item.read ? new Date() : null,
    }]
  })
  if (docs.length > 0) await Notification.create(docs)
}

async function writeActivities(
  adminId: string,
  developerId: string,
  tasks: { id: string; title: string }[],
  specs: { id: string; title: string }[],
  activities: SeedPayload['activities'],
): Promise<void> {
  const tasksByTitle = new Map(tasks.map((task) => [task.title, task.id]))
  const specsByTitle = new Map(specs.map((spec) => [spec.title, spec.id]))
  const docs = activities.flatMap((item) => {
    const actorId = item.actor === 'admin' ? adminId : developerId
    const taskId = item.taskTitle ? tasksByTitle.get(item.taskTitle) ?? null : null
    const specId = item.specTitle ? specsByTitle.get(item.specTitle) ?? null : null
    if (!taskId && !specId) return []
    return [{
      actorId,
      type: item.type,
      taskId,
      specId,
      meta: item.meta,
    }]
  })
  if (docs.length > 0) await Activity.create(docs)
}

async function writeSavedFilters(
  adminId: string,
  developerId: string,
  filters: SeedPayload['savedFilters'],
): Promise<void> {
  const docs = filters.map((filter) => ({
    userId: filter.user === 'admin' ? adminId : developerId,
    name: filter.name,
    resource: 'tasks' as const,
    query: filter.query,
  }))
  if (docs.length > 0) await SavedFilter.create(docs)
}

async function ensureSample(adminId: string, developerId: string): Promise<void> {
  if (process.env.SEED_FORCE === 'true') {
    await clearDemoData()
  } else if ((await Task.countDocuments()) > 0) {
    logger.info('Sample data already present — set SEED_FORCE=true to replace it')
    return
  }

  const payload = buildSeedPayload(adminId, developerId)
  const specs = await Spec.create(payload.specs)
  const taskDocs = await writeTasks(specs, payload)
  const taskRefs = taskDocs.map((task) => ({ id: String(task._id), title: task.title }))
  const specRefs = specs.map((spec) => ({ id: String(spec._id), title: spec.title }))

  await writeComments(adminId, developerId, taskRefs, specRefs, payload.comments)
  await writeRevisions(specRefs, payload.revisions)
  await writeNotifications(adminId, developerId, taskRefs, payload.notifications)
  await writeActivities(adminId, developerId, taskRefs, specRefs, payload.activities)
  await writeSavedFilters(adminId, developerId, payload.savedFilters)
}

async function seed(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    throw new Error('Refusing to seed in production without ALLOW_SEED=true')
  }
  await connectDb()
  const users = await ensureUsers()
  if (!users.admin || !users.developer) throw new Error('Seed users were not created')
  await ensureSample(users.admin.id, users.developer.id)
  logger.info('Seed complete', {
    specs: await Spec.countDocuments(),
    tasks: await Task.countDocuments(),
    comments: await Comment.countDocuments(),
    notifications: await Notification.countDocuments(),
    activities: await Activity.countDocuments(),
  })
  await disconnectDb()
}

seed().catch((error: unknown) => {
  logger.error('Seed failed', { message: error instanceof Error ? error.message : 'unknown' })
  process.exit(1)
})
