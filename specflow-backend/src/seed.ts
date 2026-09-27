import { connectDb, disconnectDb } from './config/db'
import { logger } from './config/logger'
import { Spec } from './models/Spec'
import { Task } from './models/Task'
import { User } from './models/User'

const ACCOUNTS = [
  { name: 'SpecFlow Admin', email: 'admin@specflow.dev', password: 'Admin1234!', role: 'admin' as const },
  { name: 'SpecFlow Dev', email: 'dev@specflow.dev', password: 'Dev12345!', role: 'developer' as const },
]

async function ensureUsers() {
  const created = []
  for (const account of ACCOUNTS) {
    const existing = await User.findOne({ email: account.email })
    if (existing) {
      created.push(existing)
      continue
    }
    created.push(await User.create(account))
  }
  return { admin: created[0], developer: created[1] }
}

async function ensureSample(adminId: string, developerId: string): Promise<void> {
  if ((await Task.countDocuments()) > 0) return
  const spec = await Spec.create({
    title: 'Refresh token rotation',
    businessGoal: 'Keep sessions short-lived without forcing people to sign in every fifteen minutes.',
    technicalApproach: 'Issue a 15 minute access token and rotate a 7 day refresh token stored in an httpOnly cookie.',
    apiDesign: 'POST /auth/login, POST /auth/refresh, POST /auth/logout. Refresh reads the cookie and returns a new access token.',
    edgeCases: ['Reuse of a rotated refresh token is rejected.', 'Logout increments the token version.'],
    acceptanceCriteria: ['Access tokens expire in 15 minutes.', 'Refresh tokens are not readable from JavaScript.'],
    regressionRisks: 'A bad cookie domain would sign every user out on deploy.',
    status: 'in-review',
    createdBy: adminId,
    tasks: [],
  })
  const tasks = await Task.create([
    {
      title: 'Store refresh tokens in httpOnly cookies',
      description: 'Stop writing session secrets to localStorage.',
      status: 'done',
      priority: 'high',
      assignedTo: developerId,
      createdBy: adminId,
      specId: spec.id,
      tags: ['auth'],
    },
    {
      title: 'Reject reused refresh tokens',
      description: 'Increment tokenVersion on every refresh and logout.',
      status: 'in-progress',
      priority: 'critical',
      assignedTo: developerId,
      createdBy: adminId,
      specId: spec.id,
      tags: ['auth', 'security'],
    },
    {
      title: 'Document demo accounts',
      description: 'Add the seeded admin and developer to the README.',
      status: 'backlog',
      priority: 'low',
      assignedTo: null,
      createdBy: adminId,
      tags: ['docs'],
    },
  ])
  spec.tasks = tasks.filter((task) => task.specId).map((task) => task._id)
  await spec.save()
}

async function seed(): Promise<void> {
  await connectDb()
  const users = await ensureUsers()
  if (!users.admin || !users.developer) throw new Error('Seed users were not created')
  await ensureSample(users.admin.id, users.developer.id)
  logger.info('Seed complete')
  await disconnectDb()
}

seed().catch((error: unknown) => {
  logger.error('Seed failed', { message: error instanceof Error ? error.message : 'unknown' })
  process.exit(1)
})
