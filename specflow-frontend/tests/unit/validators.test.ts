import { describe, expect, it } from 'vitest'
import { fieldErrors, loginSchema, specSchema, taskSchema } from '@/utils/validators'

describe('form validation', () => {
  it('requires a valid email on login', () => {
    const errors = fieldErrors(loginSchema, { email: 'nope', password: 'Password1' })
    expect(errors.email).toMatch(/valid email/)
  })

  it('requires a task title', () => {
    const errors = fieldErrors(taskSchema, {
      title: '',
      description: '',
      priority: 'medium',
      status: 'backlog',
      dueDate: '',
      tags: [],
    })
    expect(errors.title).toMatch(/required/)
  })

  it('requires at least one acceptance criterion', () => {
    const errors = fieldErrors(specSchema, {
      title: 'Auth',
      businessGoal: 'Stay signed in',
      technicalApproach: 'Rotate tokens',
      apiDesign: '',
      edgeCases: [],
      acceptanceCriteria: [],
      regressionRisks: '',
      status: 'draft',
    })
    expect(errors.acceptanceCriteria).toMatch(/at least one/i)
  })
})
