# Althea Escapes — Sanity CMS Integration Design

Date: 2026-11-11
Status: Approved in conversation (build as described)
Note: `/home/bobak/hobby/althea` is not a git repo yet; this doc lives in `docs/` at the root, above both projects.

## Intent and why

Althea Escapes is currently a fully static Next.js site. All content — the four adventure
concepts, three landscape collections, three journal field notes, FAQs, hero slides, and
every page's marketing copy — lives in code (`althea-web/data/*.ts`) or is hardcoded in
page components. The goal is to make Sanity the content backend so everything can be
edited in a Studio without touching code, while the site's design, URLs, and behavior
stay identical.

The user asked to: implement Sanity CMS now, go through the static content and replicate
everything we have, and add adventures (as CMS documents).

## Goals

1. Every piece of current static content is represented in a Sanity content model.
2. The Next.js app renders from Sanity when content exists, with the exact current
   markup, styling, URLs, and behavior.
3. Seeding the dataset replicates today's site 1:1 (documents + image assets).
4. Sanity Studio gives a structured, friendly editing experience (typed schemas,
   organized desk, Presentation Tool with click-to-edit Visual Editing).
5. The existing Playwright test suite stays green before seeding and without network
   access to Sanity.

## Non-goals

- No redesign, no new pages, no booking/enquiry features.
- No localization (single language, English).
- No rehosting of the Studio (it stays standalone in `studio-althea-escape/`).
- No webhook-based revalidation infrastructure (Live Content API covers freshness).

## Anti-goals

- Empty or unreachable dataset must not produce empty or broken pages (fallback exists).
- Tests must not depend on the Sanity project being reachable or seeded.
- Stega characters must never leak into `<head>` metadata.

## Constraints

- Next.js `16.4.6` (App Router), React 19, Tailwind 4, GSAP hero, Base UI components.
  `althea-web/AGENTS.md` warns that this Next version may differ from training data;
  relevant `node_modules/next/dist/docs/` must be consulted when touching app code.
- Studio is `studio-althea-escape/` (Sanity v6, yarn), project `cxo16e4x`, dataset
  `production`, currently with an empty schema — standalone architecture already correct.
- Two separate npm projects (npm lockfile in web, yarn in studio); no workspace tooling.
- The agent cannot log into the user's Sanity account; dataset seeding and CORS setup
  are user-run commands (documented).
- Playwright tests pin current content and behavior (hero titles, FAQ copy, brief
  download filename, route coverage incl. `/adventures/not-an-escape` → noindex 404).

## Approaches considered

1. **Sanity as source of truth with static fallback (chosen).** Pages fetch via GROQ;
   when a query errors or returns nothing, render the existing static data. Keeps the
   site and tests working before seeding, offline, and on CI. Downside: static data
   files remain in the repo as fallback (documented as such).
2. **Hard cutover.** Empty dataset = empty pages. Rejected: breaks tests and the site
   until seeding succeeds; no offline capability.
3. **Collections-only in CMS.** Model adventures/destinations/articles/FAQs but keep
   page copy in code. Rejected by user: "replicate everything" — full modeling chosen.
4. **Images as path strings vs Sanity assets.** Chose Sanity image assets (uploaded from
   current `/public/images` files) so editors manage images; hotspot support included.
   `next.config.ts` gains a `cdn.sanity.io` remote pattern; the Next Image optimizer
   serves Sanity images. Local `/images/*` files remain (fallback + source for seeding).

## Content model

### Documents

**`adventure`** — one document per escape; holds both hero-slide and detail-page fields
(today `heroSlides` and `escapes` are joined by slug):

- `title` (string, required) — hero display title, e.g. "TAKE THE LEAP"
- `name` (string, required) — detail page name, e.g. "Take the leap"
- `slug` (slug, required, from `name`)
- `eyebrow` (string) — hero eyebrow, e.g. "Air Adventure"
- `description` (text) — hero description
- `heroImage` (image w/ alt + hotspot) + `heroDesktopFocus`, `heroMobileFocus`
  (optional strings like "50% 82%" for per-breakpoint art direction; hotspot is the
  Studio-friendly fallback when they're empty)
- `cardImage` (image w/ alt) — carousel/rail card art
- `category` (string list: Air / Water / Land / Wilderness, required)
- `destination` (reference → `destination`, required)
- `mood`, `pace`, `bestFor` (strings)
- `intro`, `story` (text)
- `quote` (string)
- `highlights`, `bring` (string arrays)
- `dayFlow` (array of `{title, copy}`)
- `heroOrder` (number) — ordering in the home hero carousel

**`destination`** — `title/name`, `slug`, `eyebrow`, `image` (+alt), `image2` (+alt),
`headline`, `intro`, `paragraphs` (string array), `moments` (string array),
`category` (string, e.g. "Land & Wilderness").

**`article`** — `title`, `slug`, `categoryLabel` (e.g. "A PLACE TO START"),
`minutes` (number → rendered "4 MIN READ"), `image` (+alt), `excerpt`,
`chapters` (array of `{title, body}` where body is Portable Text — only editorial rich
text in the model), `order` (number).

**`faq`** — `question` (string, required), `answer` (text, required), `order` (number).
Used on `/faqs` (all), `/contact` (slice from 4th), home FAQ preview (first 4), via
`order`.

### Singletons (explicit `_id`s, managed through Studio Structure)

- **`siteSettings`** (`_id: siteSettings`): wordmark parts, header nav links, plan CTA
  label, footer blurb/tagline/links/legal links.
- **`homePage`** (`_id: homePage`): hero section label, introduction section copy +
  elements footer, featured escapes (array of `{escape: reference, name, detail}`),
  story section (image, note, copy, link), destinations preview (array of
  `{destination: reference, eyebrow, title, detail}` — first item renders wide),
  planning guide copy + steps, FAQ preview references, closing CTA (image, copy, link).
- **`page`** (singleton per page, `_id: aboutPage|contactPage|planPage|faqsPage|
  privacyPage|termsPage|adventuresPage|destinationsPage|journalPage`):
  `intro {eyebrow, title, description}`, `seo {title, description}` (seeded with today's
  exact `<head>` strings, which differ from the visible copy), then per-page fields:
  - about: panorama (image + note), story section, values array, closing copy
  - contact: feature block, options array, FAQ section heading
  - plan: planner copy (step headings, kickers, option lists, aside copy)
  - faqs: CTA title
  - privacy/terms: `sections` array of `{title, copy}`
  - adventures/destinations/journal: intro counter/notes and PageCTA titles for the
    three listing routes

**Shared/global copy** (identical across pages) lives on `siteSettings`, grouped into
fieldsets so the Studio stays navigable:

- `pageCta` — the recurring closing block (kicker "MAKE IT YOUR OWN", default title,
  action label, note)
- `adventureLabels`, `destinationLabels`, `journalCopy` — detail-page section chrome
  (kickers like "THE EXPERIENCE", "The shape of your day", detail-facts labels,
  signoff copy)
- `heroDialog` — dialog panel titles/descriptions/notes for menu/adventures/
  destinations/about/plan/contact panels, plus the hero CTA label ("Explore
  adventure")
- `escapePageFaq` — the three "before you say yes" questions + sidebar copy (same on
  every adventure)
- `site` — root title/description for the layout `metadata`

Dynamic-route SEO stays derivable (adventure → `name` + `intro`, destination → `intro`,
article → `excerpt`), matching today's code.

### Left in code (not modeled)

- Interactive planner logic/brief template (EscapePlanner download mechanics).
- Category filter chips (derived from adventure `category` values + "All escapes").
- Per-breakpoint hero focus *defaults* when fields are empty (hotspot-derived).
- Layout/CSS, routing, the not-found page.

## Web integration (`althea-web`)

- Deps: `next-sanity@13` (peers: sanity, styled-components, @sanity/client — npm
  resolves), `@sanity/image-url`, `@portabletext/react`.
- `sanity/lib/client.ts` — `createClient` (projectId/dataset from env with
  `cxo16e4x`/`production` defaults, `stega` enabled for visual editing).
- `sanity/lib/live.ts` — `defineLive` + `sanityFetch` (serverToken/browserToken from
  `SANITY_API_READ_TOKEN`; absent token = live disabled, fetches still work for public
  access or fall back).
- `sanity/queries.ts` — one `defineQuery` per route (unique names for TypeGen), always
  projecting `_key` for array items; `stega: false` + `perspective: 'published'` in
  `generateMetadata`/`generateStaticParams`.
- `sanity/lib/data.ts` — mapping + fallback layer: each accessor (e.g. `getAdventures()`)
  fetches, maps documents into the existing view-model shapes (`HeroSlide`, `Escape`,
  destination/article/faq/page shapes), and on error/empty returns the static data from
  `data/*.ts`. Components keep their current props and stay visually unchanged.
- Images map via `urlFor()` (widths tuned per usage, quality/fm defaults); hero focus
  strings pass through; object-position derived from hotspot when absent.
- Layout: `<SanityLive />`; `<VisualEditing />` + disable button when draft mode on;
  `/api/draft-mode/enable|disable` routes via `defineEnableDraftMode`.
- `next.config.ts`: add `cdn.sanity.io` remote pattern for `next/image`.
- Env: `.env.example` documenting `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`; `.env.local` for real values.
- `SANITY_API_MODE=offline` (or unresolvable project) short-circuits fetches to
  fallback; Playwright's webServer env sets it so tests never depend on the network.

## Dataset read access (documented, both supported)

The `production` dataset is private by default. The seed README documents both paths:

1. **Public dataset (recommended for a public marketing site):** set dataset visibility
   to public in Sanity Manage — anonymous reads, no token needed anywhere.
2. **Viewer-scoped read token:** create a token with viewer permissions, put it in
   `.env.local` as `SANITY_API_READ_TOKEN`. It is passed as `serverToken`/`browserToken`
   to `defineLive` per the next-sanity pattern; `browserToken` only ships to the client
   while Draft Mode is enabled (preview), never on normal requests.

If neither is set up, fetches fail closed to the static fallback — the site still works;
the README calls this out so the first Sanity-powered browse is verified deliberately.

## Studio (`studio-althea-escape`)

- `schemaTypes/` reorganized: `documents/`, `objects/` (kebab-case, `defineType` /
  `defineField` / `defineArrayMember`, icons from `@sanity/icons` subpaths).
- `structure.ts`: desk with "Content" (Adventures, Destinations, Field notes, FAQs) and
  "Site" (singletons: Home, About, Contact, Plan, FAQs page, Privacy, Terms, Settings).
- `presentationTool` with `resolve.locations` (adventure → `/adventures/{slug}`,
  destination → `/destinations/{slug}`, article → `/journal/{slug}`, singletons → fixed
  routes) and `previewUrl` → `http://localhost:3000`.
- TypeGen enabled in `sanity.cli.ts`: `path: '../althea-web/**/*.{ts,tsx}'`,
  `generates: '../althea-web/sanity.types.ts'`; queries named uniquely.
- CORS: documented user step —
  `npx sanity cors add http://localhost:3000 --credentials` (and production URL later).

## Seeding

- `studio-althea-escape/scripts/generate-seed.mjs` (node, no deps): imports the static
  data (via a TS→data extraction or duplicated mapping) and emits
  `seed/althea-production.ndjson` — one document per line, including singletons, with
  random UUID `_id`s for ordinary documents (not slug-derived) and explicit `_id`s for
  singletons; images as `_sanityAsset: "image@file:///abs/path/to/public/images/x.jpg"`.
  Hero hotspots seeded from current desktop focus percentages.
- Slugs are seeded with today's exact values (`skydiving`, `rafting`, `mountain`,
  `camping`, …) — not regenerated from names — since tests and internal links pin them;
  the Studio slug field's source stays `name` for new documents.
- User runs: `cd studio-althea-escape && npx sanity login && npx sanity datasets import
  seed/althea-production.ndjson production` (docs in `seed/README.md`, plus CORS step).
- Re-importable with `--replace` since `_id`s are stable in the file.

## Test strategy

- Existing Playwright suite must pass unchanged (fallback guarantees content parity).
- `playwright.config.ts` webServer gets `SANITY_API_MODE=offline` (if a webServer
  exists; otherwise documented env for running tests).
- `next build` must succeed without Sanity credentials (fallback paths).
- New sanity checks: typecheck (`tsc`) both projects after TypeGen; studio builds
  (`sanity build`) cleanly.

## Verification

1. `npm run build` in `althea-web` — success, all routes prerendered.
2. Playwright suite green (`npm run test:e2e`).
3. Studio: `yarn dev` renders all types; structure shows all documents; `sanity build`
   passes; TypeGen emits `sanity.types.ts` and web `tsc` passes.
4. Seed file sanity: every document validates against schema names/fields; asset paths
   exist.
5. (User, post-handoff) import + browse live site on Sanity data; visual editing works
   after CORS is added.
