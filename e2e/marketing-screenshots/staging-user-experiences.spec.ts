import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const outputDir = path.resolve('website-assets/mobile-app')
fs.mkdirSync(outputDir, { recursive: true })

const creatorEmail = process.env.DFY_CREATOR_EMAIL
const creatorPassword = process.env.DFY_CREATOR_PASSWORD
const runnerEmail = process.env.DFY_RUNNER_EMAIL
const runnerPassword = process.env.DFY_RUNNER_PASSWORD

async function signIn(page: Page, email: string, password: string, roleHeading: string) {
  await page.goto('/')
  await expect(page.getByText('Welcome Back!', { exact: true })).toBeVisible({ timeout: 45_000 })
  await page.locator('input[placeholder="your@email.com"]').fill(email)
  await page.locator('input[placeholder="••••••••"]').fill(password)
  await page.getByText('Sign In', { exact: true }).last().click()
  await expect(page.getByText(roleHeading, { exact: true })).toBeVisible({ timeout: 60_000 })
}

async function capture(page: Page, name: string) {
  await page.screenshot({
    path: path.join(outputDir, name),
    fullPage: true,
    animations: 'disabled',
  })
}

test('capture existing staging creator experience without submitting changes', async ({ page }) => {
  test.skip(!creatorEmail || !creatorPassword, 'Creator credentials are available only in the DFY-FE workflow')
  await signIn(page, creatorEmail!, creatorPassword!, 'Task Creator Dashboard')
  await capture(page, 'dfy-mobile-creator-dashboard.png')

  const postedTasks = page.getByText('My Posted Tasks', { exact: true })
  if (await postedTasks.count()) {
    await postedTasks.first().click()
    await capture(page, 'dfy-mobile-creator-posted-tasks.png')
  }

  // Opening the task form is safe; do not submit a task or initiate payment.
  const postAction = page.getByText('Post', { exact: true })
  if (await postAction.count()) {
    await postAction.first().click()
    await capture(page, 'dfy-mobile-creator-post-task.png')
  }
})

test('capture existing staging runner experience without claiming tasks', async ({ page }) => {
  test.skip(!runnerEmail || !runnerPassword, 'Runner credentials are available only in the DFY-FE workflow')
  await signIn(page, runnerEmail!, runnerPassword!, 'Task Runner Dashboard')
  await capture(page, 'dfy-mobile-runner-dashboard.png')

  const browse = page.getByText('Browse', { exact: true })
  if (await browse.count()) {
    await browse.first().click()
    await capture(page, 'dfy-mobile-runner-browse-tasks.png')
  }

  const myTasks = page.getByText('My Tasks', { exact: true })
  if (await myTasks.count()) {
    await myTasks.first().click()
    await capture(page, 'dfy-mobile-runner-my-tasks.png')
  }
})
