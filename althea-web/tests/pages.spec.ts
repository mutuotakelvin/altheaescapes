import { test, expect } from '@playwright/test';

test('FAQ uses the Base UI accordion with keyboard navigation', async ({ page }) => {
  await page.goto('/');
  const faq = page.getByRole('region', { name: 'Adventure questions' });
  const first = faq.getByRole('button', { name: 'Do I need adventure experience?' });
  await first.focus(); await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(faq.getByRole('button', { name: 'Can I come with friends?' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
});

test('all detail and information pages load directly with a single heading and no overflow', async ({ page }) => {
  test.setTimeout(120_000);
  const routes = ['/adventures','/adventures/skydiving','/adventures/rafting','/adventures/mountain','/adventures/camping','/destinations','/destinations/highlands','/destinations/river-country','/destinations/coastal-horizons','/about','/contact','/plan','/journal','/journal/first-adventure','/journal/slower-weekend','/journal/choose-your-element','/faqs','/privacy','/terms'];
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    }
  }
  await page.goto('/adventures/not-an-escape');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('trail');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('navigation, collection filters and adventure links lead to full pages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Adventures', exact: true }).click();
  await expect(page).toHaveURL(/\/adventures$/);
  await page.getByRole('button', { name: 'Water', exact: true }).click();
  await expect(page.locator('.collection-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Discover Own the rapids' }).click();
  await expect(page).toHaveURL(/\/adventures\/rafting$/);
  await expect(page.getByRole('heading', { name: 'The shape of your day' })).toBeVisible();
  await page.getByRole('link', { name: 'Build my escape' }).first().click();
  await expect(page).toHaveURL(/\/plan$/);
});

test('trip planner creates a downloadable brief and can be edited', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('checkbox', { name: 'Water', exact: true }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Your crew').selectOption('Friends');
  await page.getByLabel('Group size').fill('4');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('When would you like to go?').selectOption('A long weekend');
  await page.getByLabel('Anything that would make it yours?').fill('A river escape with friends.');
  await page.getByRole('button', { name: 'Review my escape' }).click();
  await expect(page.getByRole('region', { name: 'Your escape brief' })).toContainText('Water');
  await expect(page.getByRole('region', { name: 'Your escape brief' })).toContainText('4 people');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download my brief' }).click();
  expect((await download).suggestedFilename()).toBe('my-althea-escape.txt');
  await page.getByRole('button', { name: 'Edit my brief' }).click();
  await expect(page.getByRole('checkbox', { name: 'Water', exact: true })).toBeChecked();
});

test('mobile menu reaches pages and closes with Escape', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage(); await page.goto('/about');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await menu.tap(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(menu).toBeFocused();
  await menu.tap();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Destinations' }).tap();
  await expect(page).toHaveURL(/\/destinations$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await context.close();
});

test('navbar stays at the top while scrolling on home and detail pages', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/about', '/adventures/rafting']) {
      await page.goto(route);
      await page.evaluate(() => scrollTo(0, 1200));
      const header = page.locator('header.site-header');
      await expect(header).toBeInViewport();
      expect(Math.abs((await header.boundingBox())!.y)).toBeLessThan(1);
      await expect(header.getByRole('link', { name: 'Althea Escapes home' })).toBeVisible();
    }
  }
});

test('the planner remains above the footer on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/plan');
  const aside = await page.locator('.planner-aside').boundingBox();
  const footer = await page.locator('.site-footer').boundingBox();
  expect(aside!.y + aside!.height).toBeLessThanOrEqual(footer!.y);
});

test('the homepage photograph extends behind the translucent sticky navbar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.locator('header.site-header');
  expect(Math.abs((await page.locator('.cinematic-hero').boundingBox())!.y)).toBeLessThan(1);
  await expect(header).toHaveAttribute('data-hero-past', 'false');
  const alpha = () => header.evaluate(element => Number(getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.[3] ?? 1));
  expect(await alpha()).toBeLessThan(0.5);
  await page.evaluate(() => scrollTo(0, document.querySelector('.cinematic-hero')!.getBoundingClientRect().height));
  await expect(header).toHaveAttribute('data-hero-past', 'true');
  await expect.poll(alpha).toBeGreaterThan(0.8);
  expect(Math.abs((await header.boundingBox())!.y)).toBeLessThan(1);
});
