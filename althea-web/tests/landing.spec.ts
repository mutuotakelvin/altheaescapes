import { test, expect } from '@playwright/test';

test('landing sections are reachable without overflow on phones and desktop', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Featured escapes' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Destinations preview' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'How to plan your escape' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('featured escapes, FAQs and closing planning action work', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('link', { name: 'View escape: Follow the whitewater' });
  await card.click();
  await expect(page).toHaveURL(/\/adventures\/rafting$/);
  await page.goto('/');
  const question = page.getByRole('button', { name: 'How do I book an escape?' });
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Booking isn’t open yet.', { exact: false })).toBeVisible();
  await page.locator('.closing-escape').getByRole('link', { name: 'Plan an escape' }).click();
  await expect(page).toHaveURL(/\/plan$/);
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Our story' }).click();
  await expect(page).toHaveURL(/\/about$/);
});
