# Sanity CMS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sanity the content backend for Althea Escapes — every current static content item modeled, editable in the Studio, rendered by the Next.js app with identical markup, with static fallback, visual editing, and a seed that replicates today's site 1:1.

**Architecture:** Standalone Studio (`studio-althea-escape`, project `cxo16e4x`, dataset `production`) holds the content model. The Next.js app (`althea-web`) fetches via `next-sanity@13` Live Content API using the documented **three-layer cache-components pattern** (page orchestrator → dynamic layer resolving `getDynamicFetchOptions()` → `'use cache'` component calling accessors). Accessors map Sanity documents into today's existing view-model shapes and fall back to the static `data/*.ts` files on error/empty, so the site and Playwright suite stay green before seeding. A seed generator emits importable NDJSON (documents + image assets) replicating the current content exactly.

**Tech Stack:** Sanity Studio v6 (yarn), next-sanity@^13 (npm, peers auto-installed), @sanity/image-url, @portabletext/react, vitest, tsx, Playwright (existing).

**Spec:** `docs/superpowers/specs/2026-11-11-sanity-cms-design.md` — read it first; the plan argues from it.

## Global Constraints

- **Zero visual/behavior change** to existing UI: same markup, classes, URLs, copy. The Playwright suite (`althea-web/tests/*.spec.ts`) must stay green — additions allowed, modifications only where a test itself must learn a new prop-driven source.
- **Pinned slugs (verbatim):** adventures `skydiving`, `rafting`, `mountain`, `camping`; destinations `highlands`, `river-country`, `coastal-horizons`; articles `first-adventure`, `slower-weekend`, `choose-your-element`.
- Studio: project `cxo16e4x`, dataset `production`. Sanity schema code uses `defineType`/`defineField`/`defineArrayMember`, icons imported from `@sanity/icons/<Name>` subpaths, no `title` that merely repeats `name`.
- Sanity document IDs: explicit only for singletons (`siteSettings`, `homePage`, `aboutPage`, `contactPage`, `planPage`, `faqsPage`, `privacyPage`, `termsPage`, `adventuresPage`, `destinationsPage`, `journalPage`); ordinary documents get random UUIDs (`crypto.randomUUID()`).
- GROQ: unique `*_QUERY` variable names, array projections always include `_key`, `stega: false` for metadata, `perspective: 'published'` for static params, `| order(...)` sorts on every list query.
- **`althea-web` runs Next.js 16.4.6 with `cacheComponents: true`** — before touching app code, consult the guides in `althea-web/node_modules/next/dist/docs/` (per `althea-web/AGENTS.md`); the three-layer pattern below follows `https://www.sanity.io/docs/nextjs/cache-components`.
- `SANITY_API_MODE=offline` short-circuits every accessor to static fallback (used by Playwright's webServer env; also skips rendering `<SanityLive/>`).
- The static `data/*.ts` files are permanent fallback + seed source — do not delete them; content edits after seeding go through Sanity.
- **Multi-line strings:** wherever today's markup renders `<br />` inside a heading/tagline/paragraph, the field is an array of strings (`string[]` in view models, `array of string` in schema); components join lines with `<br />` and keep today's accent-`<span>` placement on the final line where the markup has one (presentation stays in code).
- Node ≥ 22.12. No git history exists yet (Task 0 creates it).

## Review Focus

1. **Empty or unreachable dataset must not produce empty/broken pages** — every Sanity-backed render falls back to static data. Pinned by: vitest fallback tests (Task 4) and the full Playwright suite running with `SANITY_API_MODE=offline` (Task 7).
2. **Stega characters must never reach `<head>`** — metadata fetches use `sanityFetchMetadata`/`stega: false`. Pinned by: new Playwright test asserting exact `<title>` on `/`, `/adventures`, `/adventures/rafting`, `/about` (Task 4).
3. **Slug drift breaks pinned URLs** — seed must contain exactly the pinned slugs above. Pinned by: seed validation vitest test (Task 6) and existing route-coverage test (`/adventures/not-an-escape` → noindex 404).
4. **Ordering drift** (hero slide order, FAQ order, article order, destination order) — queries sort by `order`/`heroOrder`; seed validation asserts sequential unique order values. Pinned by: seed validation test (Task 6).
5. **Draft documents leaking into prerendered pages** — `generateStaticParams` uses `sanityFetchStaticParams` (`perspective: 'published'`, `stega: false`) with fallback to static slugs. Pinned by: `next build` prerender succeeding with empty dataset + type-level review.

---

### Task 0: Initialize git

**Files:**
- Create: `/home/bobak/hobby/althea/.gitignore`, `/home/bobak/hobby/althea/README.md` (stub: one line per project, expanded in Task 7)

**Interfaces:**
- Produces: a git repo at the workspace root so subsequent tasks can commit; existing per-project `.gitignore`s already cover `node_modules`, `.next`, `dist`, `yarn.lock` is committed.

- [ ] **Step 1: Create root `.gitignore`** covering `node_modules/`, `.next/`, `.sanity/`, `.env*.local`, `.env`, `test-results/`, `playwright-report/`, `*.tsbuildinfo`, `coverage/`.
- [ ] **Step 2: `git init` + initial commit** of the untouched workspace (`git add -A && git commit -m "chore: import althea workspace"`), and verify `git status` is clean after.

---

### Task 1: Studio content model

**Files:**
- Create: `studio-althea-escape/schemaTypes/documents/adventure.ts`, `destination.ts`, `article.ts`, `faq.ts`, `page.ts`, `homePage.ts`, `siteSettings.ts`
- Create: `studio-althea-escape/schemaTypes/objects/chapter.ts`, `seo.ts`, `link.ts`, `question.ts` (Portable Text lives inline in `chapter.body`; images never get a shared object — see Schema details)
- Create: `studio-althea-escape/schemaTypes/index.ts` (replace), `studio-althea-escape/structure.ts`, `studio-althea-escape/src/presentation/resolve.ts` (created here, wired in Task 5)
- Modify: `studio-althea-escape/sanity.config.ts` (structure + title "Althea Escapes"), `studio-althea-escape/sanity.cli.ts` (typegen config)

**Interfaces:**
- Produces (schema type names, consumed by Task 2 queries and Task 6 seed): `adventure`, `destination`, `article`, `faq`, `page`, `homePage`, `siteSettings`; object types `chapter`, `seo`, `navLink`, `question`.
- TypeGen config in `sanity.cli.ts`: `typegen: { path: '../althea-web/**/*.{ts,tsx}', schema: 'schema.json', generates: '../althea-web/sanity.types.ts', overloadClientMethods: true }`.

Schema details (field names are the contract for queries/seed/mappers). Fields marked **lines** below are `type: 'array', of: [{type: 'string'}]` because today's markup renders `<br />` inside them (see Global Constraints):

- `adventure` (icon: `FireIcon`): `title` string (hero title, required), `name` string (detail name, required), `slug` slug required with `source: name`, `eyebrow` string, `description` text, `heroImage` image (`hotspot: true`, fields: `alt` string required-warning), `heroDesktopFocus`/`heroMobileFocus` optional strings (e.g. "50% 82%"), `cardImage` image (fields: `alt`), `category` string with `options.list` [Air, Water, Land, Wilderness] required, `destination` reference → `destination` required, `mood`, `pace`, `bestFor` strings, `intro` text, `story` text, `quote` string, `highlights`/`bring` string arrays (min 1), `dayFlow` array of inline object `{title string, copy text}`, `heroOrder` number required.
- `destination` (icon: `MapIcon`): `name` string required, `slug` slug required (source `name`), `eyebrow` string, `image` image (+`alt`), `image2` image (+`alt`), `headline` string, `intro` text, `paragraphs` string array, `moments` string array, `category` string, `order` number.
- `article` (icon: `DocumentTextIcon`): `title` string required, `slug` slug required (source `title`), `categoryLabel` string, `minutes` number, `image` image (+`alt`), `excerpt` text, `chapters` array of `chapter` objects, `order` number.
- `chapter` object: `title` string, `body` Portable Text (`type: 'array', of: [{type: 'block'}]`).
- `faq` (icon: `HelpCircleIcon`): `question` string required, `answer` text required, `order` number.
- `page` (icon: `DocumentIcon`): `intro` object `{eyebrow, title, description}` + `seo` object `{title, description}` + optional `ctaTitle` string (seed only where the page passes an explicit PageCTA title today: about, faqs, journal, destinations listing; adventures listing + journal detail use the shared `pageCta.defaultTitle`) + per-instance optional fields, each grouped in a named fieldset so each singleton's Studio form reads clean (each singleton uses only its subset):
  - about: `panorama` object `{image, note}` + `story` object `{kicker, heading lines, paragraphs string[]}` + `values` array `{title, copy}` + `closing` object `{kicker, heading lines, copy}` (accent span on last heading line)
  - contact: `feature` object `{kicker, heading lines, paragraphs string[], cta link}` + `options` array `{label, heading, copy, link}` + `faqHeading` string ("A good place to start.")
  - plan: `planner` object `{steps string[], headings string[], kickers string[4] (indexed by step; seed ["STEP 1 OF 3","STEP 2 OF 3","STEP 3 OF 3","A STARTING POINT, MADE BY YOU"]), crewOptions string[], timingOptions string[], paceOptions string[], aside object {label, heading, intro, items string[], note, link}}`
  - faqs: (ctaTitle only)
  - privacy/terms: `sections` array `{title, copy}`
  - listings: `introCounter` object `{number, label}` (adventures only; renders `04 <small>WAYS TO GET OUTSIDE</small>`) + `note` string (destinations only; "These are landscape collections. …")
- `homePage` (icon: `HomeIcon`): `heroLabel` string ("CHOOSE YOUR ESCAPE"); `introduction` object `{kicker, heading lines, paragraphs string[], linkLabel, footerLabel}`; `explore` object `{kicker, title, copy lines}`; `featured` object `{kicker, heading, description, note, linkLabel, items array {escape reference→adventure, name string, detail string}}`; `story` object `{image, note, kicker, heading lines, paragraphs string[], linkLabel}`; `destinations` object `{kicker, heading, description, items array {destination reference, eyebrow, title, detail}}`; `planning` object `{kicker, heading lines, linkLabel, steps array {title, copy}}`; `faq` object `{kicker, heading lines, copy, questions array of references → faq}`; `closing` object `{image, kicker, heading lines, copy, ctaLabel}`; `seo` object. The introduction's elements footer (Air/Water/Land/Wilderness links) stays code-derived (Task 3).
- `siteSettings` (icon: `CogIcon`), grouped fieldsets: `site` `{title, description}` (root layout metadata), `brand` `{wordmark, wordmarkSuffix}`, `navigation` array of `navLink {label, href}` + `planCtaLabel`, `footer` `{tagline lines, backLabel, links array of navLink, legal array of navLink, copyright, signoff}`, `pageCta` `{kicker, defaultTitle, actionLabel, note}`, `adventureLabels` `{experienceKicker, dayKicker, dayHeading, packingKicker, packingHeading, packingCopy, questionsKicker, questionsHeading, factsElement, factsFeeling, factsMadeFor, factsLandscape, relatedKicker, relatedHeading, relatedLinkLabel}`, `destinationLabels` `{placeKicker, momentsKicker, categoryHeading, backLabel, ctaTitle}` (destination detail PageCTA title: "Bring this landscape into your plans."), `journalCopy` `{signoffKicker, signoff, moreLinkLabel, backLabel, indexLabel}`, `heroDialog` `{menuEyebrow, previewEyebrow, menuTitle, selectorTitle, aboutTitle, defaultTitle, selectorDescription, aboutDescription, defaultDescription, prototypeNote, destinationsNote, readMoreLabel, keepExploringLabel, menuLinks array of navLink}` (dialog panel id + menu hash derive from `href.slice(1)`), `heroCtaLabel` string, `escapePageFaq` array of `question {question, answer}`, `escapeSidebar` object `{kicker, heading lines, copy, ctaLabel, statusLabel, note, contactLabel}`.
- `seo` object type: `{title string, description text}`.
- `navLink` object type: `{label string, href string}`.
- `question` object type: `{question string, answer text}`.
- **Images never get a shared object type** — inline `image` fields each declare `fields: [alt]` (and `hotspot: true` where focal art direction matters: `heroImage`, `image`, `image2`, panorama/closing/story images).

Structure (`structure.ts`): top list "Content" → Adventures, Destinations, Field notes (articles), FAQs (document type lists); divider; "Site" → singletons in order: Home page, About, Contact, Plan your escape, FAQs page, Adventures page, Destinations page, Journal page, Privacy, Terms, Site settings (each `S.document().schemaType(...).documentId(<explicit _id>)`). Exclude singleton types from any generic list.

- [ ] **Step 1: Write the schema files** per the interfaces above (all `defineType`/`defineField`/`defineArrayMember`, icons from `@sanity/icons` subpaths, validation: required on titles/slugs/question/answer, `rule.max(200).warning()` on `seo.description`).
- [ ] **Step 2: Wire `sanity.config.ts`** — title `Althea Escapes`, `structureTool({structure})`, keep `visionTool()` (presentation tool added in Task 5). Update `schemaTypes/index.ts` to export all types in the order: objects then documents.
- [ ] **Step 3: Wire `sanity.cli.ts` typegen config** (exact config in Interfaces).
- [ ] **Step 4: Verify the studio compiles and validates** — Run: `cd studio-althea-escape && yarn build`. Expected: build succeeds with no schema errors. Then Run: `npx sanity schemas validate`. Expected: all types valid.
- [ ] **Step 5: Verify dev boots** — Run: `yarn dev` (background), confirm it serves on :3333 and the desk renders the structure, then kill it.
- [ ] **Step 6: Commit** — `git add studio-althea-escape && git commit -m "feat(studio): content model for adventures, destinations, articles, FAQs, pages, settings"`.

---

### Task 2: Web Sanity foundation (client, live, queries, image URLs)

**Files:**
- Create: `althea-web/sanity/lib/client.ts`, `althea-web/sanity/lib/live.ts`, `althea-web/sanity/lib/image.ts`, `althea-web/sanity/queries.ts`, `althea-web/.env.example`
- Modify: `althea-web/next.config.ts` (add `cacheLife: {default: sanity}` from `next-sanity/live/cache-life` + `images.remotePatterns` for `cdn.sanity.io`), `althea-web/package.json` (scripts: `typecheck`, `test`)

**Interfaces:**
- Consumes: schema type/field names from Task 1.
- Produces (exact exports, consumed by Tasks 4–6):
  - `client.ts`: `export const client = createClient({projectId, dataset, useCdn: true, apiVersion: '2026-02-27', perspective: 'published', stega: {studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333'}})` — `projectId`/`dataset` default to `cxo16e4x`/`production` when env vars absent.
  - `live.ts`: `export const {sanityFetch, SanityLive} = defineLive({client, serverToken: token, browserToken: token, strict: true})` where `token = process.env.SANITY_API_READ_TOKEN` (may be undefined — do not throw at import time); `export interface DynamicFetchOptions {perspective: LivePerspective; stega: boolean}`; `export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions>` (published/stega:false unless draft mode, then `resolvePerspectiveFromCookies` fallback `'drafts'`/stega:true); `export async function sanityFetchStaticParams(...)` and `export async function sanityFetchMetadata(...)` both `'use cache'` with `stega: false`, per the Sanity cache-components guide.
  - `image.ts`: `export function urlFor(source: SanityImageSource)` builder over `@sanity/image-url`; `export function imageSrc(image: {asset?: {url?: string}}, width: number): string | undefined` returning `urlFor(image).width(width).url()` or undefined when no asset.
  - `queries.ts` (all `defineQuery`, unique names; every array projection includes `_key`; all list queries ordered): `ADVENTURES_QUERY` (`*[_type == "adventure"] | order(heroOrder asc)` projecting `_id, title, name, "slug": slug.current, eyebrow, description, heroImage{alt, hotspot, asset->{url}}, heroDesktopFocus, heroMobileFocus, cardImage{alt, asset->{url}}, category, destination->{ "slug": slug.current, name }, mood, pace, bestFor, intro, story, quote, highlights, bring, dayFlow[]{_key, title, copy}`), `ADVENTURE_SLUGS_QUERY`, `DESTINATIONS_QUERY`/`DESTINATION_SLUGS_QUERY`/`DESTINATION_BY_SLUG_QUERY`, `ARTICLES_QUERY`/`ARTICLE_SLUGS_QUERY`/`ARTICLE_BY_SLUG_QUERY` (chapters project `{_key, title, body[]{..., children[]{..., text}}}` — full PT), `FAQS_QUERY` (`| order(order asc)`), `SITE_SETTINGS_QUERY` (`*[_id == "siteSettings"][0]` with all nested chrome), `HOME_PAGE_QUERY` (`*[_id == "homePage"][0]`, dereferencing `featured.items[]{_key, escape->{ "slug": slug.current, category, heroImage{alt, asset->{url}} }, name, detail}`, `destinations.items[]{_key, destination->{ "slug": slug.current }, eyebrow, title, detail}`, `faq.questions[]->{question, answer}`), `PAGE_QUERY` (`*[_id == $pageId][0]` with the per-page fields).

- [ ] **Step 1: Install deps** — Run: `cd althea-web && npm install next-sanity@^13 @sanity/image-url && npm install -D vitest tsx`. Expected: lockfile updated; peers (`sanity`, `styled-components`, `@sanity/client`) resolved by npm.
- [ ] **Step 2: Consult Next docs** — read `node_modules/next/dist/docs/` guides for `cacheComponents`, `use cache`, and route handlers (per AGENTS.md) before writing `live.ts`/page wiring; note anything that contradicts the Sanity cache-components guide and adapt.
- [ ] **Step 3: Write the four `sanity/lib` files + `queries.ts`** exactly per Interfaces.
- [ ] **Step 4: Update `next.config.ts`** with `cacheLife: {default: sanity}` and `images: {remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}]}`; keep existing flags.
- [ ] **Step 5: Create `.env.example`** documenting `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_STUDIO_URL`, `SANITY_API_READ_TOKEN`, `SANITY_API_MODE` (defaults and when to set each, referencing the design doc's two read-access paths).
- [ ] **Step 6: Generate TypeGen types** — Run: `cd studio-althea-escape && npx sanity schemas extract --force && npx sanity typegen generate`. Expected: `althea-web/sanity.types.ts` exists with `SanityDocument`/query-result types for every `*_QUERY` in `queries.ts`. (If typegen reports query parse errors, fix `queries.ts` and rerun.)
- [ ] **Step 7: Verify typecheck + build** — Run: `cd althea-web && npx tsc --noEmit && npm run build`. Expected: both pass (site unchanged, still static data).
- [ ] **Step 8: Commit** — `git add althea-web && git commit -m "feat(web): sanity client, live layer, queries, image urls"`.

---

### Task 3: Extract all static content into typed view models (no visual change)

**Files:**
- Create: `althea-web/types/content.ts` (view-model types), `althea-web/data/pages.ts` (page + chrome copy extracted verbatim)
- Modify: `althea-web/data/heroSlides.ts`, `data/escapes.ts`, `data/journal.ts` (re-export view types; keep values), every file under `althea-web/app/**/page.tsx`, `components/site/{SiteHeader,SiteFooter,PageParts,Questions}.tsx`, `components/landing/{LandingSections,EscapeIntroduction}.tsx`, `components/adventure/{ExploreByAdventure,AccordionGallery}.tsx`, `components/pages/{AdventureCollection,EscapePlanner,EscapeCards,InformationPage}.tsx`, `components/hero/HeroDialog.tsx`

**Interfaces:**
- Produces:
  - `types/content.ts` exports: `HeroSlide` (moved from `types/hero.ts`, same shape), `EscapeView` (same shape as today's `Escape`: `{name, category, region, place, mood, pace, bestFor, intro, story, highlights, day: {title, copy}[], bring, quote, slug, image: {src, alt, desktopPosition?, mobilePosition?}}`), `DestinationView` (`{slug, name, eyebrow, image, alt, headline, intro, paragraphs, moments, image2, category}` — plain string images), `ArticleView` (`{slug, title, category, minutes, image, alt, excerpt, sections: {title, body: PortableTextBlock[]}[]}`), `FaqView` (`{question, answer}`), `PageIntroView` (`{eyebrow, title, description}`), `PageView` (intro + seo + the per-page fields listed in Task 1's `page` bullet, field-for-field, `string[]` where Task 1 marks **lines**), `HomePageView` (mirrors Task 1's `homePage` groups field-for-field), `SiteChromeView` (every chrome group from Task 1's `siteSettings`), `NavView` (`{label, href}`).
  - `data/pages.ts` exports the verbatim copy: `siteChrome: SiteChromeView`, `homePageContent: HomePageView`, and `pageContent: Record<PageId, PageView>` where `PageId = 'aboutPage' | 'contactPage' | 'planPage' | 'faqsPage' | 'privacyPage' | 'termsPage' | 'adventuresPage' | 'destinationsPage' | 'journalPage'`.
  - `data/escapes.ts` keeps `export const escapes`/`destinations`/`commonQuestions`/`categories` (values unchanged) but typed as `EscapeView[]`/`DestinationView[]`/`FaqView[]`; `data/journal.ts` maps its current paragraphs into PT-style blocks so `ArticleView.sections[].body` is the single render shape.
- Client components that currently import data directly become **prop-driven** (serializable props only): `AccordionGallery({items})` (delete its `DEFAULT_ITEMS` import of heroSlides), `ExploreByAdventure({explore, items})`, `EscapeIntroduction({introduction, elementLinks})`, `LandingSections({home, faqs, chrome})`, `HeroDialog({...dialogCopy, slides, ...})`, `SiteHeader({nav, planCtaLabel, hero})`, `SiteFooter({chrome})`, `EscapePlanner({adventures, planner})`, `AdventureCollection({items, categories})`. Server parents pass values from `data/pages.ts` (still static in this task). Derived chrome stays in code: `elementLinks` = categories minus "All escapes" → first escape per category by hero order (labels `Air`/`Water`/`Land`/`Wilderness`, hrefs `/adventures/{slug}`); hero-dialog panel ids derive from `menuLinks` via `href.slice(1)`; `PageCTA` renders `title ?? chrome.pageCta.defaultTitle`; multi-line `string[]` fields render `<br />`-joined with today's accent-`<span>` placement (Global Constraints).
- `PortableText` from `@portabletext/react` renders `ArticleView.sections[].body` in `app/journal/[slug]/page.tsx` (default block renderer emits `<p>`, matching current CSS).

- [ ] **Step 1: Write `types/content.ts` + `data/pages.ts`** copying every string verbatim from the existing pages/components (about, contact, plan, faqs, privacy, terms, listing intros/counters/notes, PageCTA furniture, hero dialog copy, planner copy/option lists, siteSettings chrome, home landing sections copy). This is transcription, not authoring — do not paraphrase.
- [ ] **Step 2: Refactor `data/{heroSlides,escapes,journal}.ts`** to the view types (values unchanged; journal paragraphs → PT blocks via a small `toBlocks(paragraphs: string[])` helper kept in `data/journal.ts`).
- [ ] **Step 3: Make the client components prop-driven** per Interfaces; update their server parents (`PageShell` fetches nothing yet — it imports `siteChrome` from `data/pages.ts` and passes it down; `app/page.tsx` passes hero slides + landing content).
- [ ] **Step 4: Switch page components to render from the view models** (`pageContent[...]`, `homePageContent`, `siteChrome`) — markup and copy byte-identical.
- [ ] **Step 5: Verify nothing changed** — Run: `cd althea-web && npm run build && npx playwright test`. Expected: build passes; **all existing tests green with zero modifications**. If a test fails, the refactor changed rendering — fix the refactor, not the test.
- [ ] **Step 6: Commit** — `git add althea-web && git commit -m "refactor(web): extract all static content into typed view models"`.

---

### Task 4: Sanity accessors with fallback + route wiring (three-layer pattern)

**Files:**
- Create: `althea-web/sanity/lib/mappers.ts`, `althea-web/sanity/lib/data.ts`, `althea-web/tests/sanity-mappers.spec.ts` (vitest), `althea-web/vitest.config.ts`, `althea-web/components/site/DisableDraftMode.tsx` (from the Sanity guide)
- Modify: all `althea-web/app/**/page.tsx` (home, adventures list+detail, destinations list+detail, journal list+detail, faqs, contact, about, plan, privacy, terms), `althea-web/app/layout.tsx` (metadata from `getSiteChrome`), `althea-web/playwright.config.ts` (webServer env)

**Interfaces:**
- Consumes: `sanityFetch`/`getDynamicFetchOptions`/`sanityFetchStaticParams`/`sanityFetchMetadata` from `live.ts` (Task 2), query names + generated `sanity.types.ts` types (Task 2), view models (Task 3).
- Produces:
  - `mappers.ts` pure functions: `mapAdventureToHeroSlide(doc: AdventureDoc, ctaLabel: string): HeroSlide` (`_id: doc._id`, `cta: {label: ctaLabel, href: '/adventures/' + slug}`), `mapAdventureToEscape(doc: AdventureDoc): EscapeView` (`region: doc.destination.slug`, `place: doc.destination.name`), `mapDestination(doc: DestinationDoc): DestinationView`, `mapArticle(doc: ArticleDoc): ArticleView`, `mapFaqs(docs): FaqView[]`, `mapSiteChrome(doc): SiteChromeView`, `mapHomePage(doc, faqs, adventures): HomePageView` (`adventures` fills the code-derived `elementLinks`), `mapPage(doc): PageView`. Image mapping: `image.src = imageSrc(image, width)` with per-context widths (hero 2000, panorama 2000, cards 900, rail 400); focus strings pass through; when absent, derive `desktopPosition/mobilePosition` from `hotspot` (`${Math.round(hotspot.x*100)}% ${Math.round(hotspot.y*100)}%`).
  - `data.ts` accessors, each `'use cache'` when it calls `sanityFetch`, taking `opts: DynamicFetchOptions`, and falling back to static data on **error or empty** (try/catch; log one-line warn): `getHeroSlides(opts)`, `getEscapes(opts)`, `getEscapeBySlug(slug, opts)`, `getDestinations(opts)`, `getDestinationBySlug(slug, opts)`, `getArticles(opts)`, `getArticleBySlug(slug, opts)`, `getFaqs(opts)`, `getSiteChrome()` (fixed `{perspective: 'published', stega: false}` — chrome is structural; documented trade-off), `getHomePage(opts)`, `getPage(pageId, opts)`, `getSlugs(kind: 'adventure'|'destination'|'article')` (published/stega false + static fallback). All short-circuit to static data when `process.env.SANITY_API_MODE === 'offline'`.
  - Every route page follows the three-layer skeleton (from the Sanity cache-components guide):
    ```tsx
    export default async function Page({params}) {           // orchestrator
      if (draftMode enabled) return <Suspense><Dynamic …/></Suspense>
      return <Cached … perspective="published" stega={false} />
    }
    async function Dynamic({params}) { /* awaits params + getDynamicFetchOptions() */ }
    async function Cached({…, perspective, stega}) { 'use cache'; /* accessor + render */ }
    ```
- `generateStaticParams` for the three `[slug]` routes: `try { sanityFetchStaticParams } catch/empty → static slugs`. `generateMetadata` on every route: `sanityFetchMetadata` + `stega: false`, falling back to today's exact static metadata strings (page `seo` fields seeded with those exact strings). Detail routes keep today's derived forms verbatim: adventure → `` `${escape.name} — Althea Escapes` `` + `intro` (`Escape not found — Althea Escapes` when missing), destination → `` `${place.name || 'Landscape not found'} — Althea Escapes` `` + `intro`, article → `` `${article.title || 'Field note not found'} — Althea Escapes` `` + `excerpt`.
- `layout.tsx`: `generateMetadata` from `getSiteChrome()` fallback to the current title/description; keep fonts/markup.

- [ ] **Step 1: Write failing vitest tests** for `mappers.ts` covering: adventure doc → `HeroSlide`/`EscapeView` (focus strings, hotspot-derived positions, dayFlow `_key`s), article doc → `ArticleView`, faq ordering, and `data.ts` fallback behavior (mock `sanityFetch` to throw and to return `[]` → accessors return static data identical to `data/*.ts` values; offline mode short-circuits without calling fetch).
- [ ] **Step 2: Run them and verify they fail** — Run: `npx vitest run`. Expected: FAIL (modules don't exist).
- [ ] **Step 3: Implement `mappers.ts` + `data.ts`** per Interfaces.
- [ ] **Step 4: Run vitest and verify pass** — Run: `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Rewire every route page** to the three-layer pattern with accessors (page bodies otherwise unchanged — they render the same view models as Task 3).
- [ ] **Step 6: Update `playwright.config.ts`** webServer to `{command: 'npm run dev', url: baseURL, reuseExistingServer: !process.env.CI, env: {SANITY_API_MODE: 'offline'}}`.
- [ ] **Step 7: Add the head-parity Playwright test** — in `tests/pages.spec.ts`: assert `<title>` equals the current exact titles on `/`, `/adventures`, `/adventures/rafting`, `/about` (pins Review Focus #2).
- [ ] **Step 8: Verify full suite** — Run: `npx playwright test`. Expected: all green (now running with the offline env).
- [ ] **Step 9: Verify production build** — Run: `npm run build`. Expected: prerender succeeds (static params fall back), no cache-boundary errors.
- [ ] **Step 10: Commit** — `git add althea-web && git commit -m "feat(web): render all content from sanity with static fallback"`.

---

### Task 5: Visual editing (draft mode, Presentation Tool)

**Files:**
- Create: `althea-web/app/api/draft-mode/enable/route.ts`, `althea-web/app/api/draft-mode/disable/route.ts`
- Modify: `althea-web/app/layout.tsx` (render `<SanityLive includeDrafts={isDraftMode} />` unless `SANITY_API_MODE=offline`, plus `<VisualEditing />` + `<DisableDraftMode />` in draft mode), `studio-althea-escape/sanity.config.ts` (add `presentationTool({resolve, previewUrl: {initial: 'http://localhost:3000', previewMode: {enable: '/api/draft-mode/enable'}}})`)

**Interfaces:**
- Consumes: `client` + token (Task 2), `resolve.ts` (Task 1).
- Produces: `resolve.ts` locations for `adventure` (`/adventures/{slug}` + `/adventures`), `destination` (`/destinations/{slug}` + `/destinations`), `article` (`/journal/{slug}` + `/journal`), and every singleton `_id` → its route; enable route via `defineEnableDraftMode({client: client.withConfig({token: process.env.SANITY_API_READ_TOKEN || ''})})`; disable route per the Sanity guide (redirect to `/`).

- [ ] **Step 1: Write the three files + wire layout/config** per Interfaces (keep layout markup otherwise identical).
- [ ] **Step 2: Verify builds** — Run: `cd althea-web && npm run build && cd ../studio-althea-escape && yarn build`. Expected: both pass; `tsc --noEmit` clean in web.
- [ ] **Step 3: Smoke-test both modes** — Run web dev + studio dev; visit `/` (no draft cookie → static fallback path), then `/api/draft-mode/enable`-style flow documented for the user (full click-to-edit needs the seeded dataset + CORS, verified post-seed). Record findings in the commit message; Task 6 Step 5 folds them into `seed/README.md`'s verification section.
- [ ] **Step 4: Commit** — `git add althea-web studio-althea-escape && git commit -m "feat: visual editing via draft mode and presentation tool"`.

---

### Task 6: Seed generator, NDJSON, and seed README

**Files:**
- Create: `althea-web/scripts/generate-seed.ts`, `althea-web/tests/seed.spec.ts` (vitest, validates the generated file), `studio-althea-escape/seed/README.md`
- Create (generated, committed): `studio-althea-escape/seed/althea-production.ndjson`
- Modify: `althea-web/package.json` (script `seed:generate`)

**Interfaces:**
- Consumes: `data/heroSlides.ts`, `data/escapes.ts`, `data/journal.ts`, `data/pages.ts` (Task 3), schema field names (Task 1), explicit singleton `_id`s.
- Deliberate deviation from the spec: the generator lives at `althea-web/scripts/generate-seed.ts` (tsx) instead of the spec's sketch of `studio-althea-escape/scripts/generate-seed.mjs`, so it imports the typed static data directly instead of duplicating mappings — do not relocate it. Multi-line fields seed as `string[]` per the Global Constraints; `ctaTitle` seeds only where Task 1 says; `kickers` seeds the four planner strings verbatim.
- Produces: NDJSON, one document per line, where ordinary docs use `crypto.randomUUID()` `_id`s (stable within the file so references resolve), singletons use their explicit `_id`s, images embed `{"_type": "image", "_sanityAsset": "image@file://" + absolute path}` + sibling `alt` (+ `hotspot` for `heroImage`, derived from the desktop focus percentages), slugs are `{"_type": "slug", "current": "<pinned slug>"}`, references are `{"_type": "reference", "_ref": "<generated id>"}`, order fields sequential from 0. Script writes to `../studio-althea-escape/seed/althea-production.ndjson` (path resolved from `process.cwd()`), printing a document count summary.
- `seed/README.md` documents: `npx sanity login`, `npx sanity datasets import seed/althea-production.ndjson production --replace`, `npx sanity cors add http://localhost:3000 --credentials`, the two dataset read-access paths (public dataset vs viewer token in `.env.local`), re-running the generator, and how to verify the site is actually on Sanity data (temporary `SANITY_API_MODE` removal + console cache HITs), plus the visual-editing checklist from Task 5.

- [ ] **Step 1: Write the failing seed validation test** — `tests/seed.spec.ts` parses the ndjson (if missing, fail with instruction to run the generator) and asserts: every line is valid JSON with `_id`/`_type`; `_type`s ∈ schema types; singleton `_id`s exactly the eleven listed; adventure slugs = pinned set; destination slugs = pinned set; article slugs = pinned set; every `_ref` target exists in the file; every `_sanityAsset` path exists on disk (resolve against `/home/bobak/hobby/althea/althea-web/public`); `heroOrder`/`order` values unique and zero-based sequential per type.
- [ ] **Step 2: Run it and verify it fails** (file missing). Run: `npx vitest run tests/seed.spec.ts`.
- [ ] **Step 3: Implement `scripts/generate-seed.ts`** per Interfaces (map each static view model back to schema-shaped documents; hero slides merge into their adventure by slug).
- [ ] **Step 4: Run the generator, then the validation test** — Run: `npm run seed:generate && npx vitest run tests/seed.spec.ts`. Expected: PASS with 28 documents (4 adventures, 3 destinations, 3 articles, 7 FAQs, 11 singletons) — assert that count in the test.
- [ ] **Step 5: Write `seed/README.md`** per Interfaces.
- [ ] **Step 6: Commit** — `git add althea-web studio-althea-escape && git commit -m "feat(seed): dataset seed replicating current content"`.

---

### Task 7: Final verification and docs

**Files:**
- Modify: `althea-web/README.md`, `studio-althea-escape/README.md`, root `README.md` (expand Task 0 stub), `althea-web/package.json` (scripts: `seed:generate` exists, add `test:unit`)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Full local verification** — Run in order: `cd althea-web && npx tsc --noEmit && npx vitest run && npm run build && npx playwright test`, then `cd ../studio-althea-escape && yarn build`. Expected: all pass.
- [ ] **Step 2: Online-mode sanity check** — Run `npm run dev` *without* `SANITY_API_MODE` against the real (empty) dataset, load `/`, `/adventures`: pages render fallback content; console shows the one-line fallback warning, no unhandled errors.
- [ ] **Step 3: Update the three READMEs**: how to run both apps, where content lives now, the seeding/import/CORS runbook (linking `seed/README.md`), env vars, and the offline mode.
- [ ] **Step 4: Run the Next.js agent feedback pass** — per `althea-web/AGENTS.md`, from `althea-web` run `npx --no-install next internal agent-feedback-instructions` once and follow its guidance (only if qualifying friction was retained; otherwise note that).
- [ ] **Step 5: Commit** — `git add -A && git commit -m "docs: sanity integration runbook and final verification"`.

---

## Post-plan notes for the executor

- The three-layer skeleton in Task 4's Interfaces is the canonical one from `https://www.sanity.io/docs/nextjs/cache-components` — copy that shape, don't improvise.
- When a Playwright test fails, the default assumption is that the change broke parity — fix the change, not the test. Only tests explicitly added by this plan are new.
- If `next build` reports cache-boundary errors (`cacheTag`/`draftMode` inside `'use cache'`), re-read the guide section on the three-layer pattern and move request-time reads outward.
- Sanity Studio dev (`yarn dev`) regenerates `althea-web/sanity.types.ts` on schema/query changes — re-run `npx tsc --noEmit` after touching either side.
