import { test, expect } from '@playwright/test';

test('staggered menu opens with brand layers and navigates to a full page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.staggered-menu-panel')).toBeVisible();
  await expect(dialog.locator('.sm-prelayer')).toHaveCount(2);
  await expect(dialog.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link')).toHaveCount(7);
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Destinations', exact: true }).click();
  await expect(page).toHaveURL(/\/destinations$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('rapid menu reversals preserve focus and allow reopening', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (let index = 0; index < 3; index++) {
    const trigger = page.getByRole('button', { name: 'Open navigation menu' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('button', { name: 'Close navigation menu' }).dispatchEvent('click');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('menu keeps keyboard focus inside and restores it after closing', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/contact');
  const trigger = page.getByRole('button', { name: 'Open navigation menu' });
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeFocused();
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
