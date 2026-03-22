import { expect, test } from '@playwright/test';

test.describe('public shell', () => {
  test('login screen shows app title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Salon Opening Planner/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
  });
});
