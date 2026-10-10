export type Role = 'admin' | 'developer'
export type TaskStatus = 'backlog' | 'in-progress' | 'in-review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type SpecStatus = 'draft' | 'ready' | 'in-review' | 'approved'
export type ThemePref = 'light' | 'dark' | 'system'
export type AccentPref = 'teal' | 'amber' | 'slate'
export type DensityPref = 'comfortable' | 'compact'
export type TasksViewPref = 'list' | 'board'
export type LandingPagePref = 'dashboard' | 'my-work' | 'tasks'
export type TasksScopePref = 'all' | 'mine'

export interface AppearancePreferences {
  theme: ThemePref
  accent: AccentPref
  density: DensityPref
}

export interface NotificationPreferences {
  taskAssigned: boolean
  commentCreated: boolean
  mentionCreated: boolean
  taskStatus: boolean
}

export interface DefaultPreferences {
  tasksView: TasksViewPref
  landingPage: LandingPagePref
  tasksScope: TasksScopePref
}

export interface UserPreferences extends AppearancePreferences {
  notifications: NotificationPreferences
  defaults: DefaultPreferences
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  taskAssigned: true,
  commentCreated: true,
  mentionCreated: true,
  taskStatus: true,
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  accent: 'teal',
  density: 'comfortable',
  notifications: { ...DEFAULT_NOTIFICATION_PREFS },
  defaults: { tasksView: 'list', landingPage: 'dashboard', tasksScope: 'all' },
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  preferences: UserPreferences
}

export interface ProfileStats {
  openAssigned: number
  watching: number
  unreadNotifications: number
  blockedAssigned: number
}

export interface ProfileDto {
  user: User
  stats: ProfileStats
  recent: ActivityItem[]
}

export interface MyWorkDto {
  assigned: Task[]
  watching: Task[]
  mentioned: Task[]
  blocked: Task[]
  overdue: Task[]
}

export interface UserRef {
  id: string
  name: string
  email: string
}

export interface ChecklistItem {
  key: string
  label: string
  done: boolean
}

export interface TaskRef {
  id: string
  title: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: UserRef | null
  createdBy: UserRef
  specId: string | null
  tags: string[]
  dueDate: string | null
  watching: boolean
  blocked: boolean
  blockedReason: string
  blockedBy: TaskRef[]
  checklist: ChecklistItem[]
  externalUrl: string
  createdAt: string
  updatedAt: string
}

export interface Spec {
  id: string
  title: string
  businessGoal: string
  technicalApproach: string
  apiDesign: string
  edgeCases: string[]
  acceptanceCriteria: string[]
  regressionRisks: string
  status: SpecStatus
  archivedAt: string | null
  approvedAt: string | null
  approvedBy: UserRef | null
  createdBy: UserRef
  tasks: Task[]
  taskCount: number
  tasksDone: number
  createdAt: string
  updatedAt: string
}

export interface SpecRevision {
  id: string
  specId: string
  version: number
  title: string
  status: SpecStatus
  createdBy: UserRef
  createdAt: string
}

export interface Comment {
  id: string
  taskId: string | null
  specId: string | null
  body: string
  author: UserRef
  mentions: string[]
  createdAt: string
  updatedAt: string
}

export type ActivityType =
  | 'task.created'
  | 'task.status'
  | 'task.assigned'
  | 'comment.created'
  | 'spec.status'

export interface ActivityItem {
  id: string
  type: ActivityType
  taskId: string | null
  specId: string | null
  meta: Record<string, unknown>
  actor: UserRef
  createdAt: string
}

export interface AppNotification {
  id: string
  type: string
  message: string
  taskId: string | null
  specId: string | null
  readAt: string | null
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

export interface TaskFilters {
  status?: string
  priority?: string
  assignedTo?: string
  q?: string
  due?: string
  blocked?: string
}

export interface SpecFilters {
  status?: string
  q?: string
  includeArchived?: boolean
  archivedOnly?: boolean
  needsTasks?: boolean
}

export interface TaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string | null
  specId?: string | null
  tags?: string[]
  dueDate?: string | null
  blockedReason?: string | null
  blockedBy?: string[]
  checklist?: ChecklistItem[]
  externalUrl?: string | null
}

export interface SpecForm {
  title: string
  businessGoal: string
  technicalApproach: string
  apiDesign: string
  edgeCases: string[]
  acceptanceCriteria: string[]
  regressionRisks: string
  status: SpecStatus
}

export interface SpecsByStatus {
  draft: number
  ready: number
  inReview: number
  approved: number
}

export interface DashboardStats {
  totalTasks: number
  openTasks: number
  specsInReview: number
  completedThisWeek: number
  overdueCount: number
  dueSoonCount: number
  blockedCount: number
  unspeccedOpenCount: number
  specsByStatus: SpecsByStatus
}

export const PAGE_LIMIT = 10
