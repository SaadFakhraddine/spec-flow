export type Role = 'admin' | 'developer'
export type TaskStatus = 'backlog' | 'in-progress' | 'in-review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type SpecStatus = 'draft' | 'ready' | 'in-review' | 'approved'
export type ThemePref = 'light' | 'dark' | 'system'
export type AccentPref = 'teal' | 'amber' | 'slate'
export type DensityPref = 'comfortable' | 'compact'

export const TASK_STATUSES: TaskStatus[] = ['backlog', 'in-progress', 'in-review', 'done']
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']
export const SPEC_STATUSES: SpecStatus[] = ['draft', 'ready', 'in-review', 'approved']
export const THEME_PREFS: ThemePref[] = ['light', 'dark', 'system']
export const ACCENT_PREFS: AccentPref[] = ['teal', 'amber', 'slate']
export const DENSITY_PREFS: DensityPref[] = ['comfortable', 'compact']

export type TasksViewPref = 'list' | 'board'

export interface NotificationPreferences {
  taskAssigned: boolean
  commentCreated: boolean
  mentionCreated: boolean
  taskStatus: boolean
}

export interface DefaultPreferences {
  tasksView: TasksViewPref
}

export interface UserPreferences {
  theme: ThemePref
  accent: AccentPref
  density: DensityPref
  notifications: NotificationPreferences
  defaults: DefaultPreferences
}

/** @deprecated use UserPreferences — kept as alias for appearance fields */
export type AppearancePreferences = Pick<UserPreferences, 'theme' | 'accent' | 'density'>

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  taskAssigned: true,
  commentCreated: true,
  mentionCreated: true,
  taskStatus: true,
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  accent: 'teal',
  density: 'comfortable',
  notifications: { ...DEFAULT_NOTIFICATION_PREFS },
  defaults: { tasksView: 'list' },
}

export interface Actor {
  id: string
  role: Role
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role: Role
  preferences: UserPreferences
}

export interface UserRef {
  id: string
  name: string
  email: string
}

export interface ChecklistItemDto {
  key: string
  label: string
  done: boolean
}

export interface TaskRef {
  id: string
  title: string
}

export interface TaskDto {
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
  checklist: ChecklistItemDto[]
  externalUrl: string
  createdAt: string
  updatedAt: string
}

export interface SpecDto {
  id: string
  title: string
  businessGoal: string
  technicalApproach: string
  apiDesign: string
  edgeCases: string[]
  acceptanceCriteria: string[]
  regressionRisks: string
  status: SpecStatus
  createdBy: UserRef
  tasks: TaskDto[]
  taskCount: number
  createdAt: string
  updatedAt: string
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
  checklist?: ChecklistItemDto[]
  externalUrl?: string | null
}

export interface SpecInput {
  title: string
  businessGoal: string
  technicalApproach: string
  apiDesign?: string
  edgeCases?: string[]
  acceptanceCriteria: string[]
  regressionRisks?: string
  status?: SpecStatus
}

export type DueFilter = 'overdue' | 'soon'

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  q?: string
  due?: DueFilter
  blocked?: boolean
}

export interface Page {
  page: number
  limit: number
}

export interface DashboardDto {
  totalTasks: number
  openTasks: number
  specsInReview: number
  completedThisWeek: number
  overdueCount: number
  dueSoonCount: number
  blockedCount: number
  unspeccedOpenCount: number
  recentActivity: TaskDto[]
}
