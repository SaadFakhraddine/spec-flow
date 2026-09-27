export type Role = 'admin' | 'developer'
export type TaskStatus = 'backlog' | 'in-progress' | 'in-review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type SpecStatus = 'draft' | 'ready' | 'in-review' | 'approved'

export interface User {
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
  createdBy: UserRef
  tasks: Task[]
  taskCount: number
  createdAt: string
  updatedAt: string
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

export interface DashboardStats {
  totalTasks: number
  openTasks: number
  specsInReview: number
  completedThisWeek: number
  recentActivity: Task[]
}

export const PAGE_LIMIT = 10
