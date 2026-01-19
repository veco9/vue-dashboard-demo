import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('loads with widgets visible', async ({ page }) => {
    await page.goto('/')

    // Wait for at least one widget title to appear (mock data has ~350ms delay)
    await expect(page.locator('.widget-header-titlelabel').first()).toBeVisible()

    // Verify multiple widgets loaded
    const widgetTitles = page.locator('.widget-header-titlelabel')
    await expect(widgetTitles).not.toHaveCount(0)
  })

  test('edit mode toggle shows and hides palette', async ({ page }) => {
    await page.goto('/')

    // Palette should not be visible initially
    await expect(page.locator('.dashboard-palette')).not.toBeVisible()

    // Click "Edit dashboard" button
    await page.getByRole('button', { name: 'Edit dashboard' }).click()

    // Palette should now be visible
    await expect(page.locator('.dashboard-palette')).toBeVisible()

    // Click "Done" to exit edit mode
    await page.getByRole('button', { name: 'Done' }).click()

    // Palette should be hidden again
    await expect(page.locator('.dashboard-palette')).not.toBeVisible()
  })

  test('theme toggle switches dark and light mode', async ({ page }) => {
    await page.goto('/')

    // App starts in dark mode (default from storage.ts)
    await expect(page.locator('html')).toHaveClass(/app-dark/)

    // Click the sun icon button (dark mode → light mode)
    await page.getByRole('button', { name: 'Switch to light mode' }).click()

    // Should no longer have dark class
    await expect(page.locator('html')).not.toHaveClass(/app-dark/)

    // Click the moon icon button (light mode → dark mode)
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()

    // Should have dark class again
    await expect(page.locator('html')).toHaveClass(/app-dark/)
  })
})
