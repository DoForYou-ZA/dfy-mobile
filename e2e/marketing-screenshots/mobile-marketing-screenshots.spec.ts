import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const outputDir = path.resolve('website-assets/mobile-app')
fs.mkdirSync(outputDir, { recursive: true })

test('capture sign-in and registration screens for website use', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Welcome Back!', { exact: true })).toBeVisible({ timeout: 45_000 })

  // These are real app screens rendered through Expo Web at a phone viewport.
  // They are suitable for marketing previews, but are not native Android emulator captures.
  await page.screenshot({
    path: path.join(outputDir, 'dfy-mobile-sign-in.png'),
    fullPage: true,
    animations: 'disabled',
  })

  await page.getByText('Sign Up', { exact: true }).click()
  await expect(page.getByText('Join DoForYou', { exact: true })).toBeVisible()

  await page.screenshot({
    path: path.join(outputDir, 'dfy-mobile-registration.png'),
    fullPage: true,
    animations: 'disabled',
  })
})
