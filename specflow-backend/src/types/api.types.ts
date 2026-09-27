export type Role = 'admin' | 'developer'
export type TaskStatus = 'backlog' | 'in-progress' | 'in-review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type SpecStatus = 'draft' | 'ready' | 'in-review' | 'approved'

export const TASK_STATUSES: TaskStatus[] = ['backlog', 'in-progress', 'in-review', 'done']
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']
export const SPEC_STATUSES: SpecStatus[] = ['draft', 'ready', 'in-review', 'approved']

export interface Actor {
  id: string
  role: Role
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface UserRef {
  id: string
  name: string
  email: string
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

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  q?: string
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
  recentActivity: TaskDto[]
}
