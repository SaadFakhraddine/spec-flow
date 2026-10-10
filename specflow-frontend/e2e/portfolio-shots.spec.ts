import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../portfolio-shots')

async function hideToasts(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('[role="status"]').forEach((el) => {
      ;(el as HTMLElement).style.visibility = 'hidden'
    })
  })
}

async function shot(
  page: Page,
  name: string,
  opts?: { fullPage?: boolean },
): Promise<void> {
  await hideToasts(page)
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage: opts?.fullPage ?? true,
    animations: 'disabled',
    caret: 'hide',
  })
}

async function loginAsAdmin(page: Page, opts?: { fresh?: boolean }): Promise<void> {
  if (opts?.fresh) await page.context().clearCookies()
  await page.goto('/login')
  if (!/\/login\/?$/.test(page.url())) {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15_000 })
    return
  }
  await page.getByLabel('Email').fill('admin@specflow.dev')
  await page.getByLabel('Password').fill('Admin1234!')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/dashboard/)
}

async function clearTaskFilters(page: Page): Promise<void> {
  const clear = page.getByRole('button', { name: 'Clear' })
  if (await clear.isVisible().catch(() => false)) await clear.click()
}

test.describe('portfolio screenshots', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    // Skip enter transitions so drawers/panels are fully painted for shots.
    reducedMotion: 'reduce',
  })

  test.beforeAll(async () => {
    await mkdir(OUT_DIR, { recursive: true })
  })

  test('capture key SpecFlow views', async ({ page }) => {
    test.setTimeout(180_000)

    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await shot(page, '01-login', { fullPage: false })

    await page.getByRole('button', { name: 'Create an account' }).click()
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible()
    await shot(page, '02-register', { fullPage: false })

    await loginAsAdmin(page)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Open tasks')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Activity' })).toBeVisible()
    await shot(page, '03-dashboard')

    await page.goto('/my-work')
    await expect(page.getByRole('heading', { name: 'My work' })).toBeVisible()
    await expect(page.getByText('Assigned')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('link').filter({ hasText: /.+/ }).first()).toBeVisible()
    await shot(page, '04-my-work')

    await page.goto('/tasks?view=list')
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 })
    await clearTaskFilters(page)
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 })
    await shot(page, '05-tasks-list')

    await page.getByRole('button', { name: 'Board' }).click()
    await expect(page).toHaveURL(/view=board/)
    await clearTaskFilters(page)
    await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'In progress' })).toBeVisible()
    await shot(page, '06-tasks-board', { fullPage: false })

    await page.getByRole('button', { name: 'Create task' }).click()
    const drawer = page.getByRole('dialog', { name: 'New task' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('heading', { name: 'New task' })).toBeVisible()
    await drawer.getByLabel('Title').fill('Portfolio demo task')
    await expect(drawer.getByLabel('Title')).toHaveValue('Portfolio demo task')
    await shot(page, '07-create-task-drawer', { fullPage: false })
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)

    await page.goto('/tasks?view=list')
    await clearTaskFilters(page)
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 })
    await page.locator('table tbody tr').first().locator('td').nth(1).click()
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9]+/i, { timeout: 15_000 })
    await expect(page.locator('#comment-body')).toBeVisible({ timeout: 15_000 })
    await shot(page, '08-task-detail')

    await page.goto('/specs?view=pipeline')
    await expect(page.getByRole('heading', { name: 'Specs' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Notification preferences')).toBeVisible()
    await shot(page, '09-specs-pipeline', { fullPage: false })

    await page.goto('/specs?view=table')
    await expect(page.getByRole('heading', { name: 'Specs' })).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 })
    await shot(page, '10-specs-table')

    await page.locator('table tbody tr').first().locator('td').first().click()
    await expect(page).toHaveURL(/\/specs\/[a-f0-9]+/i, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Linked tasks' })).toBeVisible({
      timeout: 15_000,
    })
    await shot(page, '11-spec-detail')

    await page.goto('/specs/new')
    await expect(page.getByRole('heading', { name: 'New spec' })).toBeVisible({ timeout: 15_000 })
    await page.getByLabel('Title').fill('Portfolio handoff agreement')
    await page.getByLabel('Business goal').fill('Show reviewers a filled spec form with amber branding.')
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot(page, '12-specs-new', { fullPage: false })

    await loginAsAdmin(page, { fresh: true })
    await expect(page.getByText('Open tasks')).toBeVisible({ timeout: 15_000 })

    const settings: [string, string, string][] = [
      ['13-settings-appearance', 'appearance', 'Appearance'],
      ['14-settings-profile', 'profile', 'Profile'],
      ['15-settings-notifications', 'notifications', 'Notifications'],
      ['16-settings-defaults', 'defaults', 'Defaults'],
    ]
    for (const [file, section, heading] of settings) {
      await page.goto(`/settings/${section}`)
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({
        timeout: 15_000,
      })
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
      await shot(page, file, { fullPage: false })
    }

    await page.goto('/dashboard')
    await expect(page.getByText('Open tasks')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Notifications' }).click()
    const panel = page.getByRole('dialog', { name: 'Notifications' })
    await expect(panel).toBeVisible()
    await expect(panel.getByText('Mark all read')).toBeVisible()
    await expect(panel.getByText(/ago|No notifications/i).first()).toBeVisible()
    // Crop to the panel — it anchors near the sidebar foot and is easy to miss in a page shot.
    await hideToasts(page)
    await panel.screenshot({
      path: path.join(OUT_DIR, '17-notifications-panel.png'),
      animations: 'disabled',
    })

    await page.goto('/this-route-does-not-exist')
    await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible()
    await shot(page, '18-not-found', { fullPage: false })
  })
})
