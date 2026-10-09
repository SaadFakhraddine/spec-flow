import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../portfolio-shots')

async function shot(page: Page, name: string): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('[role="status"]').forEach((el) => {
      ;(el as HTMLElement).style.visibility = 'hidden'
    })
  })
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage: true,
  })
}

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@specflow.dev')
  await page.getByLabel('Password').fill('Admin1234!')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/dashboard/)
}

test.describe('portfolio screenshots', () => {
  test.beforeAll(async () => {
    await mkdir(OUT_DIR, { recursive: true })
  })

  test('capture key SpecFlow views', async ({ page }) => {
    test.setTimeout(180_000)

    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await shot(page, '01-login')

    await page.getByRole('button', { name: 'Create an account' }).click()
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible()
    await shot(page, '02-register')

    await loginAsAdmin(page)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await shot(page, '03-dashboard')

    await page.goto('/my-work')
    await expect(page.getByRole('heading', { name: 'My work' })).toBeVisible()
    await shot(page, '04-my-work')

    await page.goto('/tasks?view=list')
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 })
    await shot(page, '05-tasks-list')

    await page.goto('/tasks?view=board')
    await expect(page.locator('select').first()).toBeVisible({ timeout: 15_000 })
    await shot(page, '06-tasks-board')

    await page.getByRole('button', { name: 'Create task' }).click()
    await expect(page.getByRole('dialog', { name: 'New task' })).toBeVisible()
    await shot(page, '07-create-task-drawer')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'New task' })).toHaveCount(0)

    await page.goto('/tasks?view=list')
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 })
    await page.locator('table tbody tr').first().locator('td').nth(1).click()
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9]+/i, { timeout: 15_000 })
    await expect(page.locator('#comment-body')).toBeVisible({ timeout: 15_000 })
    await shot(page, '08-task-detail')

    await page.goto('/specs')
    await expect(page.getByRole('heading', { name: 'Specs' })).toBeVisible()
    await shot(page, '09-specs-list')

    await page.goto('/specs/new')
    await expect(page).toHaveURL(/specs\/new/)
    await shot(page, '10-specs-new')

    await page.goto('/specs')
    await expect(page.getByRole('heading', { name: 'Specs' })).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 })
    await page.locator('table tbody tr').first().locator('td').first().click()
    await expect(page).toHaveURL(/\/specs\/[a-f0-9]+/i, { timeout: 15_000 })
    await shot(page, '11-spec-detail')

    const settings: [string, string][] = [
      ['12-settings-appearance', 'appearance'],
      ['13-settings-profile', 'profile'],
      ['14-settings-notifications', 'notifications'],
      ['15-settings-defaults', 'defaults'],
    ]
    for (const [file, section] of settings) {
      await page.goto(`/settings/${section}`)
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
      await shot(page, file)
    }

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Notifications' }).click()
    await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible()
    await shot(page, '16-notifications-panel')

    await page.goto('/this-route-does-not-exist')
    await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible()
    await shot(page, '17-not-found')
  })
})
