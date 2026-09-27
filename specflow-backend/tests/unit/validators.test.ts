import { validationResult, type ValidationChain } from 'express-validator'
import { describe, expect, it } from 'vitest'
import { loginValidator, registerValidator } from '../../src/validators/authValidators'
import { createSpecValidator } from '../../src/validators/specValidators'
import { createTaskValidator } from '../../src/validators/taskValidators'

async function messages(chains: ValidationChain[], body: Record<string, unknown>): Promise<string[]> {
  const req = { body, query: {}, params: {} }
  for (const chain of chains) await chain.run(req)
  return validationResult(req).array().map((item) => String(item.msg))
}

describe('validators', () => {
  it('accepts a valid registration', async () => {
    const errors = await messages(registerValidator, { name: 'Ada', email: 'ada@specflow.dev', password: 'Password1' })
    expect(errors).toEqual([])
  })

  it('rejects a weak password', async () => {
    const errors = await messages(registerValidator, { name: 'Ada', email: 'ada@specflow.dev', password: 'password' })
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects login without a password', async () => {
    const errors = await messages(loginValidator, { email: 'ada@specflow.dev', password: '' })
    expect(errors).toContain('Password is required')
  })

  it('rejects a task title that is too long', async () => {
    const errors = await messages(createTaskValidator, { title: 'x'.repeat(101) })
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects a spec with no acceptance criteria', async () => {
    const errors = await messages(createSpecValidator, {
      title: 'Spec',
      businessGoal: 'Ship it',
      technicalApproach: 'Build it',
      acceptanceCriteria: [],
    })
    expect(errors).toContain('Add at least one acceptance criterion')
  })
})
