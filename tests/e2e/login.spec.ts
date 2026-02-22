import { test, expect } from '@playwright/test'

test('login screen renders', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
  await expect(page.getByLabel(/email/i)).toBeVisible()
  await expect(page.getByLabel(/senha/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
})
