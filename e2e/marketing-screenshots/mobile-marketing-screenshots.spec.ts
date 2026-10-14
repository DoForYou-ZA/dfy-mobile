import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const outputDir = path.resolve('website-assets/mobile-app')
fs.mkdirSync(outputDir, { recursive: true })

test('record the splash-to-login startup preview', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: outputDir,
      size: { width: 390, height: 844 },
    },
  })
  const page = await context.newPage()
  await page.goto(baseURL!)
  const video = page.video()
  try {
    await page.waitForTimeout(8500)
  } finally {
    await context.close()
    if (video) {
      await video.saveAs(path.join(outputDir, 'dfy-mobile-splash-current-changes.webm'))
    }
  }
})

test('capture sign-in and registration screens for website use', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(2800)
  await page.screenshot({
    path: path.join(outputDir, 'dfy-mobile-splash.png'),
    fullPage: true,
    animations: 'disabled',
  })

  await expect(page.getByText('Welcome back', { exact: true })).toBeVisible({ timeout: 45_000 })
  await expect(page.getByRole('button', { name: 'Show password' })).toBeVisible()
  await expect(page.getByText('Show', { exact: true })).toHaveCount(0)

  // These are real app screens rendered through Expo Web at a phone viewport.
  // They are suitable for marketing previews, but are not native Android emulator captures.
  await page.screenshot({
    path: path.join(outputDir, 'dfy-mobile-sign-in.png'),
    fullPage: true,
    animations: 'disabled',
  })

  await page.getByText('Create an account', { exact: true }).click()
  await expect(page.getByText('Create Account', { exact: true })).toBeVisible()
  await expect(page.getByText('+27', { exact: true })).toBeVisible()

  const backButton = await page.getByRole('button', { name: 'Back to sign in' }).boundingBox()
  const logo = await page.getByRole('img', { name: 'DoForYou logo' }).first().boundingBox()
  const phoneField = await page.getByPlaceholder('81 234 5678').boundingBox()
  const continueButton = await page.getByRole('button', { name: 'Continue' }).boundingBox()
  expect(backButton).not.toBeNull()
  expect(logo).not.toBeNull()
  const backOverlapsLogo = backButton!.x < logo!.x + logo!.width &&
    backButton!.x + backButton!.width > logo!.x &&
    backButton!.y < logo!.y + logo!.height &&
    backButton!.y + backButton!.height > logo!.y
  expect(backOverlapsLogo).toBe(false)
  expect(phoneField).not.toBeNull()
  expect(continueButton).not.toBeNull()
  expect(continueButton!.y - (phoneField!.y + phoneField!.height)).toBeLessThan(120)

  await page.screenshot({
    path: path.join(outputDir, 'dfy-mobile-registration.png'),
    fullPage: true,
    animations: 'disabled',
  })
})
