import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must include a number')
    .regex(/[A-Z]/, 'Password must include an uppercase letter'),
})

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['backlog', 'in-progress', 'in-review', 'done']),
  dueDate: z.string(),
  tags: z.array(z.string().trim().min(1).max(20)).max(5, 'Use at most 5 tags'),
})

export const specSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150, 'Title must be at most 150 characters'),
  businessGoal: z.string().trim().min(1, 'Business goal is required').max(1000),
  technicalApproach: z.string().trim().min(1, 'Technical approach is required').max(5000),
  apiDesign: z.string().max(3000),
  edgeCases: z.array(z.string().trim().min(1, 'Edge case cannot be empty')).max(20),
  acceptanceCriteria: z.array(z.string().trim().min(1, 'Acceptance criterion cannot be empty')).min(1, 'Add at least one acceptance criterion'),
  regressionRisks: z.string().max(1000),
  status: z.enum(['draft', 'ready', 'in-review', 'approved']),
})

export function fieldErrors<T>(schema: z.ZodType<T>, value: unknown): Record<string, string> {
  const parsed = schema.safeParse(value)
  if (parsed.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

export function emptySpecForm() {
  return {
    title: '',
    businessGoal: '',
    technicalApproach: '',
    apiDesign: '',
    edgeCases: [''],
    acceptanceCriteria: [''],
    regressionRisks: '',
    status: 'draft' as const,
  }
}
