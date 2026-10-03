import { expect, test } from '@playwright/test'

test('admin can use board status and leave a comment', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@specflow.dev')
  await page.getByLabel('Password').fill('Admin1234!')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/dashboard/)

  await page.getByRole('link', { name: 'Tasks' }).click()
  await expect(page).toHaveURL(/tasks/)
  await page.getByRole('button', { name: 'Board' }).click()
  await expect(page).toHaveURL(/view=board/)

  const firstSelect = page.locator('select').first()
  await expect(firstSelect).toBeVisible({ timeout: 15_000 })
  const current = await firstSelect.inputValue()
  const next = current === 'done' ? 'in-review' : 'done'
  await firstSelect.selectOption(next)
  await expect(page.getByText('Status updated')).toBeVisible()

  await page.getByRole('button', { name: 'List' }).click()
  await page.locator('table tbody tr').first().click()
  await expect(page).toHaveURL(/\/tasks\//)

  const comment = `E2E comment ${Date.now()}`
  await page.locator('#comment-body').fill(comment)
  await page.getByRole('button', { name: 'Comment' }).click()
  await expect(page.getByText(comment)).toBeVisible()
})
