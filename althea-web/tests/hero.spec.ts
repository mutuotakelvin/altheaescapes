import { test, expect } from '@playwright/test';
test('carousel wraps and synchronizes rapid navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TAKE THE LEAP');
  await page.getByRole('button', { name: 'Previous adventure' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ANSWER THE WILD');
  await page.getByRole('button', { name: 'Next adventure' }).click({ clickCount: 3, delay: 70 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('RISE ABOVE LIMITS');
  await expect(page.getByRole('button', { name: 'Show RISE ABOVE LIMITS' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.slide-counter')).toContainText('03');
});
test('keyboard selection and detail-page navigation', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('button', { name: 'Show OWN THE RAPIDS' });
  await card.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('OWN THE RAPIDS');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('RISE ABOVE LIMITS');
  const cta = page.getByRole('link', { name: /Explore adventure/i });
  await cta.click(); await expect(page).toHaveURL(/\/adventures\/mountain$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rise above limits');
});
test('mobile keeps CTA and controls reachable without horizontal page overflow', async ({ page }) => {
  for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 844 }); await page.goto('/');
    await expect(page.getByRole('link', { name: /Explore adventure/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
test('reduced motion and failed media leave usable navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/_next/image**', route => route.abort());
  await page.goto('/'); await page.getByRole('button', { name: 'Next adventure' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('OWN THE RAPIDS');
});
test('touch swipes advance one slide while vertical gestures do not', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/');
  const rail = page.locator('.rail-window');
  const swipe = async (dx: number, dy: number) => {
    await rail.dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', clientX: 260, clientY: 560 });
    await rail.dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', clientX: 260 + dx, clientY: 560 + dy });
  };
  await swipe(10, -100);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TAKE THE LEAP');
  await swipe(-120, 10);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('OWN THE RAPIDS');
  await swipe(120, 10);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TAKE THE LEAP');
  await context.close();
});
test('all slides avoid story and rail collisions, including short landscape', async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1024,height:768},{width:1440,height:900},{width:1920,height:1080}]) {
    await page.setViewportSize(viewport); await page.goto('/');
    for (const title of ['TAKE THE LEAP','OWN THE RAPIDS','RISE ABOVE LIMITS','ANSWER THE WILD']) {
      await page.getByRole('button', {name:`Show ${title}`}).evaluate((e: HTMLButtonElement) => e.click());
      await expect(page.getByRole('heading', {level:1})).toHaveText(title);
      const story = await page.locator('.hero-story').boundingBox();
      const rail = await page.locator('.rail-window').boundingBox();
      expect(story && rail && (story.x + story.width <= rail.x || story.y + story.height <= rail.y)).toBeTruthy();
      await page.getByRole('link',{name:/Explore adventure/i}).scrollIntoViewIfNeeded();
      await expect(page.getByRole('link',{name:/Explore adventure/i})).toBeInViewport();
    }
  }
});
test('mobile taps and menu navigation reach full pages', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: 'Show OWN THE RAPIDS' }).tap();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('OWN THE RAPIDS');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await menu.click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Go beyond the ordinary.');
  await context.close();
});

test('desktop hero uses narrow floating previews, a cropped fourth card and one CTA pill', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Adventure collection' });
  await expect(hero.locator('.hero-kicker')).toHaveCount(0);
  await expect(hero.locator('.hero-footer')).toHaveCount(0);
  await expect(hero.locator('.rail-heading')).toHaveText('CHOOSE YOUR ESCAPE');
  const geometry = await hero.evaluate(element => {
    const rail = element.querySelector('.rail-window')!.getBoundingClientRect();
    const cards = [...element.querySelectorAll('.preview-card')].map(card => card.getBoundingClientRect());
    return { width: cards[0].width, height: cards[0].height, complete: cards.filter(card => card.left >= rail.left && card.right <= rail.right).length, partial: cards.filter(card => card.left < rail.right && card.right > rail.right).length };
  });
  expect(geometry.width).toBeGreaterThanOrEqual(155);
  expect(geometry.width).toBeLessThanOrEqual(175);
  expect(geometry.height).toBeGreaterThanOrEqual(270);
  expect(geometry.height).toBeLessThanOrEqual(310);
  expect(geometry.complete).toBe(3);
  expect(geometry.partial).toBe(1);
  const cta = hero.getByRole('link', { name: 'Explore adventure' });
  const style = await cta.evaluate(element => ({ background: getComputedStyle(element).backgroundColor, radius: parseFloat(getComputedStyle(element).borderRadius), height: element.getBoundingClientRect().height }));
  expect(style.background).toBe('rgb(199, 255, 61)');
  expect(style.radius).toBeGreaterThanOrEqual(25);
  expect(style.height).toBeGreaterThanOrEqual(48);
});

test('photograph dissolves smoothly and settles after rapid selection', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Adventure collection' });
  await expect.poll(() => hero.getAttribute('data-transitioning')).toBe('false');
  await page.getByRole('button', { name: 'Show OWN THE RAPIDS' }).click();
  await expect(hero).toHaveAttribute('data-transitioning', 'true');
  const image = hero.locator('.background-current');
  await expect(image).toHaveAttribute('data-slide', 'rafting');
  expect(await image.evaluate(element => getComputedStyle(element).clipPath)).toBe('none');
  await page.getByRole('button', { name: 'Next adventure' }).click({ clickCount: 2, delay: 60 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ANSWER THE WILD');
  await expect(hero).toHaveAttribute('data-transitioning', 'false');
  await expect(hero.locator('.background-current')).toHaveAttribute('data-slide', 'camping');
  expect(await hero.locator('.background-current').evaluate(element => getComputedStyle(element).clipPath)).toBe('none');
  await expect(page.getByRole('button', { name: 'Show ANSWER THE WILD' })).toHaveAttribute('aria-pressed', 'true');
  expect(await hero.locator('.progress-track > span').evaluate(element => getComputedStyle(element).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
});

test('navigation during entrance leaves the rail fully visible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Next adventure' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('OWN THE RAPIDS');
  await expect(page.locator('.cinematic-hero')).toHaveAttribute('data-transitioning', 'false');
  const rail = page.locator('.rail-window');
  await expect.poll(() => rail.evaluate(element => getComputedStyle(element).opacity)).toBe('1');
  expect(await rail.evaluate(element => getComputedStyle(element).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
});

test('the leading preview exits left before wrapping to the end', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.cinematic-hero')).toHaveAttribute('data-transitioning', 'false');
  await expect.poll(() => page.locator('.rail-window').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
  const first = page.getByRole('button', { name: 'Show TAKE THE LEAP' });
  const { start, samples } = await first.evaluate(async element => {
    // Measure within the rail, independently of its entrance transform.
    const position = () => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41;
    const start = position();
    const positions: number[] = [];
    const hero = element.closest('.cinematic-hero')!;
    (hero.querySelector('[aria-label="Show OWN THE RAPIDS"]') as HTMLButtonElement).click();
    let begin = 0;
    const deadline = performance.now() + 6000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      if (hero.querySelector('.background-current')?.getAttribute('data-slide') !== 'rafting') continue;
      if (!begin) begin = performance.now();
      if (performance.now() - begin >= 300) break;
      positions.push(position());
    }
    return { start, samples: positions };
  });
  expect(samples.length).toBeGreaterThan(0);
  expect(samples.every(x => x <= start + 1), JSON.stringify({ start, samples })).toBe(true);
  await expect(page.locator('.cinematic-hero')).toHaveAttribute('data-transitioning', 'false');
  expect(await first.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41)).toBeGreaterThan(start + 500);
});

test('partial previews show the photograph without cropped captions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const rail = page.locator('.rail-window');
    await expect(rail.locator('.preview-card[data-rank="0"] .card-copy')).toBeVisible();
    await expect.poll(() => rail.evaluate(element => {
      const boundary = element.getBoundingClientRect();
      return [...element.querySelectorAll('.preview-card')].filter(card => {
        const rect = card.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.right, boundary.right) - Math.max(rect.left, boundary.left));
        return visible > 0 && visible / rect.width < 0.97;
      }).every(card => getComputedStyle(card.querySelector('.card-copy')!).visibility === 'hidden');
    })).toBe(true);
  }
});

test('caption frosting renders without blurring the photograph', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.locator('.preview-card[data-rank="0"]');
  await expect(card.locator('.card-copy')).toBeVisible();
  expect(await card.locator('.card-copy').evaluate(element => getComputedStyle(element).backdropFilter)).toContain('blur(18px)');
  expect(await card.locator('img').evaluate(element => getComputedStyle(element).filter)).toBe('none');
});

test('departing photograph smoothly zooms forward while the next scene enters', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cinematic-hero')).toHaveAttribute('data-transitioning', 'false');
  const frames = await page.locator('.cinematic-hero').evaluate(async hero => {
    const departing = hero.querySelector<HTMLElement>('.background-current')!;
    const image = departing.querySelector('img')!;
    (hero.querySelector('[aria-label="Next adventure"]') as HTMLButtonElement).click();
    const samples: { scale: number; opacity: number }[] = [];
    const deadline = performance.now() + 6500;
    let began = 0;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      if (hero.querySelector('.background-current') === departing) continue;
      if (!began) began = performance.now();
      const transform = getComputedStyle(image).transform;
      const incoming = hero.querySelector('.background-current')!;
      samples.push({ scale: transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a, opacity: 1 - Number(getComputedStyle(incoming).opacity) });
      if (performance.now() - began > 1450) break;
    }
    return samples;
  });
  expect(frames.length).toBeGreaterThan(2);
  expect(frames.some(frame => frame.scale > 1.03 && frame.opacity > 0 && frame.opacity < 1)).toBe(true);
  expect(frames.every((frame, index) => index === 0 || frame.scale >= frames[index - 1].scale - 0.001)).toBe(true);
  await expect(page.locator('.cinematic-hero')).toHaveAttribute('data-transitioning', 'false');
  expect(await page.locator('.background-current img').evaluate(image => getComputedStyle(image).transform)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Next adventure' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('RISE ABOVE LIMITS');
  expect(await page.locator('.background-layer img').evaluateAll(images => images.every(image => getComputedStyle(image).transform === 'none'))).toBe(true);
});
