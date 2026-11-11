import { test, expect } from '@playwright/test';

const categories = ['Air', 'Water', 'Land', 'Wilderness'];

test('panels stay horizontal with accessible collapsed targets at every size', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Explore by adventure' });
  await expect(section).toBeVisible();
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await section.scrollIntoViewIfNeeded();
    for (const category of categories) {
      await section.getByRole('button', { name: `Expand ${category}`, exact: true }).click();
      await expect(section.getByRole('button', { name: `Expand ${category}`, exact: true })).toHaveAttribute('aria-expanded', 'true');
      const panels = await section.locator('.adventure-panel').evaluateAll(elements => elements.map(el => {
        const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height };
      }));
      expect(panels.every(p => p.width >= 43.9)).toBe(true);
      expect(panels.every(p => Math.abs(p.y - panels[0].y) < 1)).toBe(true);
      expect(panels[0].height).toBe(width < 768 ? 360 : 520);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('keyboard wraps focus, expands, and exploration opens the matching detail page', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Explore by adventure' });
  const air = section.getByRole('button', { name: 'Expand Air', exact: true });
  await air.focus();
  await page.keyboard.press('ArrowLeft');
  const wilderness = section.getByRole('button', { name: 'Expand Wilderness' });
  await expect(wilderness).toBeFocused();
  await expect(wilderness).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(air).toBeFocused();
  for (const [index, category] of categories.entries()) {
    const control = section.getByRole('button', { name: `Expand ${category}`, exact: true });
    await control.focus(); await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    await expect(control).toHaveAttribute('aria-expanded', 'true');
    const link = section.getByRole('link', { name: `Explore ${category}`, exact: true });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/adventures/${['skydiving', 'rafting', 'mountain', 'camping'][index]}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(['Take the leap', 'Own the rapids', 'Rise above limits', 'Answer the wild'][index]);
    await page.goto('/');
  }
});

test('desktop hover and rapid switching settle on the final panel', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Explore by adventure' });
  await section.scrollIntoViewIfNeeded();
  for (const category of ['Water', 'Land', 'Air', 'Wilderness']) {
    await section.getByRole('button', { name: `Expand ${category}`, exact: true }).hover();
  }
  await expect(section.getByRole('button', { name: 'Expand Wilderness' })).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(async () => {
    const widths = await section.locator('.adventure-panel').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
    return widths[3] / widths.reduce((a, b) => a + b, 0);
  }).toBeCloseTo(0.52, 1);
});

test('touch expands without navigating and reduced motion changes width immediately', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage(); await page.goto('/');
  const section = page.getByRole('region', { name: 'Explore by adventure' });
  await section.scrollIntoViewIfNeeded();
  await section.getByRole('button', { name: 'Expand Water', exact: true }).tap();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(section.getByRole('button', { name: 'Expand Water', exact: true })).toHaveAttribute('aria-expanded', 'true');
  const widths = await section.locator('.adventure-panel').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
  expect(widths[1]).toBeGreaterThan(widths[0]);
  await section.getByRole('link', { name: 'Explore Water', exact: true }).tap();
  await expect(page).toHaveURL(/\/adventures\/rafting$/);
  await context.close();
});

test('expansion has an intermediate width before settling', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Explore by adventure' });
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const panels = section.locator('.adventure-panel');
  const initial = await panels.evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
  const samples = await section.getByRole('button', { name: 'Expand Water', exact: true }).evaluate(async button => {
    const panel = button.closest('.adventure-panel')!;
    const widths: number[] = [];
    button.focus();
    const start = performance.now();
    while (performance.now() - start < 800) {
      await new Promise(requestAnimationFrame);
      widths.push(panel.getBoundingClientRect().width);
    }
    return widths;
  });
  expect(samples.some(width => width > initial[1] + 5 && width < initial[0] - 5)).toBe(true);
  await expect.poll(async () => Math.abs((await panels.nth(1).boundingBox())!.width - initial[0])).toBeLessThan(2);
});

test('keyboard expansion survives panels moving beneath a stationary pointer', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Explore by adventure' });
  await section.scrollIntoViewIfNeeded();
  const air = await section.locator('.adventure-panel').first().boundingBox();
  await page.mouse.move(air!.x + 250, air!.y + 100);
  const land = section.getByRole('button', { name: 'Expand Land', exact: true });
  await land.focus(); await page.keyboard.press('Enter');
  await expect.poll(async () => {
    const widths = await section.locator('.adventure-panel').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
    return widths[2] / widths.reduce((a, b) => a + b, 0);
  }).toBeGreaterThan(0.5);
  await expect(land).toHaveAttribute('aria-expanded', 'true');
  await expect(land).toBeFocused();
});
