# Althea Escapes

A cinematic, responsive adventure hero built with Next.js 16, React, TypeScript, Tailwind CSS 4 and GSAP. The demo is the homepage (`/`). No CMS connection or booking backend is required.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Google fonts are downloaded at build time and self-hosted by Next.js. Restart `next dev` if the custom Tailwind/Turbopack loader serves an outdated stylesheet.

```sh
npm run lint
npx tsc --noEmit
npm run build
npm start
```

## Browser checks

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright starts or reuses the local development server. To use a system Chromium, set `CHROMIUM_PATH=/usr/bin/chromium`. To check a running production build, set `TEST_BASE_URL=http://127.0.0.1:3100` (and start it with `npm start -- --port 3100`).

Tests cover wrapping, rapid navigation, keyboard selection, dialog focus, failed media, reduced motion, directional touch gestures, viewport overflow and story/rail separation across all four slides, including short landscape.

## Content and media

Edit `data/heroSlides.ts`. `types/hero.ts` defines the serializable `HeroSlide` contract. Every slide supplies an ID, slug, eyebrow, title, description, image, optional card image and CTA. Focal points are CSS object-position strings; `desktopPosition` and `mobilePosition` are independent. Images and compact card crops live in `public/images/`.

The four experiences and photographs are sample content, not confirmed offerings. See [ASSET-CREDITS.md](ASSET-CREDITS.md) for source pages and license links. Replace these with approved client photography before launch. Do not infer destinations, pricing or availability from the photographs.

Tokens live at the top of `app/globals.css`: green `#C7FF3D`, obsidian `#091111` and white `#FFFFFF`. All interface tints and shadows derive from these three colors. Photographs retain natural colors.

## Behavior

- Arrows, preview clicks and horizontal touch swipes wrap through four slides. Focus a preview and use Left/Right or Enter/Space. Offscreen previews are excluded from the tab sequence.
- Backgrounds load at responsive sizes before selection commits. A cancelled request cannot overwrite a newer selection. A four-second loading timeout or image error keeps the interface usable over the previous image or obsidian fallback.
- GSAP animates opacity and transforms; cleanup handles unmounts and Strict Mode. Reduced motion removes the large entrance and slide movements. There is no autoplay.
- Navigation and adventure links open native modal dialogs, support Escape and return focus to their trigger. Prototype panels do not submit enquiries or claim live availability.
- Short phones and landscape devices can scroll the hero vertically to reach the CTA, cards and controls. The rail intentionally clips at its right edge.

## Future Sanity integration

Keep the server-rendered page as the content boundary. Later, replace the local array with ordered published records mapped to `HeroSlide[]`; translate Sanity crop/hotspot data into image URLs and focal positions, and link CTAs to canonical adventure routes. The carousel accepts data as props and does not depend on a CMS SDK. The sibling Studio is untouched.

## Validation limits

Automated Chromium checks and desktop/mobile screenshots do not establish real-user Core Web Vitals. Measure LCP, INP and CLS in deployment and check gesture/blur performance on a physical mid-range Android device before release.
