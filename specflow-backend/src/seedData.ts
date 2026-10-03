export const SEED_ACCOUNTS = [
  { name: 'SpecFlow Admin', email: 'admin@specflow.dev', password: 'Admin1234!', role: 'admin' as const },
  { name: 'SpecFlow Dev', email: 'dev@specflow.dev', password: 'Dev12345!', role: 'developer' as const },
]

export function buildSeedPayload(adminId: string, developerId: string) {
  const specs = [
    {
      title: 'Refresh token rotation',
      businessGoal: 'Keep sessions short-lived without forcing people to sign in every fifteen minutes.',
      technicalApproach: 'Issue a 15 minute access token and rotate a 7 day refresh token in an httpOnly cookie.',
      apiDesign: 'POST /auth/login, POST /auth/refresh, POST /auth/logout.',
      edgeCases: ['Reuse of a rotated refresh token is rejected.', 'Logout increments the token version.'],
      acceptanceCriteria: ['Access tokens expire in 15 minutes.', 'Refresh tokens are not readable from JavaScript.'],
      regressionRisks: 'A bad cookie domain would sign every user out on deploy.',
      status: 'in-review' as const,
      createdBy: adminId,
      tasks: [] as unknown[],
    },
    {
      title: 'Spec to board handoff',
      businessGoal: 'Make approved specs spawn trackable work without copy-paste.',
      technicalApproach: 'Link tasks to specs and surface counts on the specs list.',
      apiDesign: 'POST /specs/:id/tasks with taskId.',
      edgeCases: ['Linking a task already on another spec moves it.'],
      acceptanceCriteria: ['Admins can link an existing task.', 'Task detail shows the linked spec.'],
      regressionRisks: 'Orphaned links if a task is deleted without cleanup.',
      status: 'ready' as const,
      createdBy: adminId,
      tasks: [] as unknown[],
    },
    {
      title: 'Dashboard workload snapshot',
      businessGoal: 'Give each role a clear picture of open work at a glance.',
      technicalApproach: 'Aggregate open tasks, specs in review, and completed-this-week counts.',
      apiDesign: 'GET /dashboard returns totals and recent activity.',
      edgeCases: ['Developers only see their open tasks.'],
      acceptanceCriteria: ['Admin sees team-wide open work.', 'Completed count resets each Monday.'],
      regressionRisks: 'Timezone drift around week boundaries.',
      status: 'draft' as const,
      createdBy: adminId,
      tasks: [] as unknown[],
    },
  ]

  const tasks = [
    {
      title: 'Store refresh tokens in httpOnly cookies',
      description: 'Stop writing session secrets to localStorage.',
      status: 'done' as const,
      priority: 'high' as const,
      assignedTo: developerId,
      createdBy: adminId,
      tags: ['auth'],
      specIndex: 0,
    },
    {
      title: 'Reject reused refresh tokens',
      description: 'Increment tokenVersion on every refresh and logout.',
      status: 'in-progress' as const,
      priority: 'critical' as const,
      assignedTo: developerId,
      createdBy: adminId,
      tags: ['auth', 'security'],
      specIndex: 0,
    },
    {
      title: 'Document demo accounts',
      description: 'Add the seeded admin and developer to the README.',
      status: 'backlog' as const,
      priority: 'low' as const,
      assignedTo: null,
      createdBy: adminId,
      tags: ['docs'],
      specIndex: 0,
    },
    {
      title: 'Link task from spec detail',
      description: 'Admin picks an existing task and attaches it to the current spec.',
      status: 'in-review' as const,
      priority: 'medium' as const,
      assignedTo: adminId,
      createdBy: adminId,
      tags: ['specs'],
      specIndex: 1,
    },
    {
      title: 'Board columns for every status',
      description: 'Ensure backlog through done all render with seeded work.',
      status: 'backlog' as const,
      priority: 'medium' as const,
      assignedTo: developerId,
      createdBy: adminId,
      tags: ['board'],
      specIndex: 1,
    },
    {
      title: 'Polish dashboard empty states',
      description: 'Show a calm empty state when recent activity is missing.',
      status: 'done' as const,
      priority: 'low' as const,
      assignedTo: developerId,
      createdBy: adminId,
      tags: ['ui'],
      specIndex: 2,
    },
  ]

  const comments = [
    { taskTitle: 'Store refresh tokens in httpOnly cookies', author: 'admin' as const, body: 'Cookie path and Secure flags are set for production cross-site use.' },
    { taskTitle: 'Store refresh tokens in httpOnly cookies', author: 'developer' as const, body: 'Verified the refresh call does not go through the axios interceptor.' },
    { taskTitle: 'Reject reused refresh tokens', author: 'admin' as const, body: 'Please add a regression note when tokenVersion bumps.' },
    { taskTitle: 'Link task from spec detail', author: 'developer' as const, body: 'UI looks good; waiting on the final empty-state copy.' },
  ]

  return { specs, tasks, comments }
}
