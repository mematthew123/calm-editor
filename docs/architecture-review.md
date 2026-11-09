# Architecture Review: Calm Editor

> **Paths have moved.** This record predates the Writing Room becoming a plugin. `apps/studio/src/writing-room/` is now `packages/writing-room/src/room/`; `apps/studio/src/actions/` and `apps/studio/src/lib/{slug,publish-details,slug-availability,image-url}.ts` are in `packages/writing-room/src/`; and `apps/studio/schemaTypes/` is `packages/writing-room/src/schema/`. See [`plugin-roadmap.md`](plugin-roadmap.md).

**Status:** Proposed (for review)
**Date:** 2026-11-07
**Scope:** Every architectural decision currently in the repo (`apps/studio`, `apps/web`, `packages/*`), checked against the Sanity best-practice guides (`.agents/skills/sanity-best-practices/references/`: `schema`, `groq`, `nextjs`, `typegen`, `project-structure`, `app-sdk`, `image`, `visual-editing`) and the existing local ADRs 0001–0003.

Legend: ✅ follows Sanity guidance · ⚖️ goes against the default on purpose, with a good reason · ⚠️ a risk or gap worth acting on

---

## Summary

The architecture holds up. The big choices (a standalone Studio in a monorepo, a custom Studio Tool for writing, App SDK sync, Live Content API with Cache Components) either match Sanity's recommendations or go against them for documented reasons. The weak spots are in the **publish path**, where three separate mechanisms each decide whether a Post can be published:

1. Studio validation
2. The Writing Room's settle-and-check step
3. Publish-time Detail derivation

They can disagree. The findings that matter most:

| # | Finding | Severity |
|---|---------|----------|
| F1 | The `slug` type's built-in uniqueness validation can block a Writing Room publish with a Details error, which breaks ADR 0002 | ⚠️ High (verify) |
| F2 | After a 4 s settle timeout, the room publishes using stale validation, and Content Lake does not enforce Studio validation | ⚠️ Medium |
| F3 | Code comments cite `docs/adr/*`, but `.gitignore` excludes that folder, so the ADRs aren't in the repo | ⚠️ Medium |
| F4 | With auto-updates off, `sanity` and `@sanity/sdk-react` have to stay in lockstep, and nothing enforces it | ⚠️ Medium |
| F5 | The slug-availability query ignores Content Release versions (`versions.*`) | ⚠️ Low–Medium |
| F6 | TypeGen hygiene: `schema.json` is tracked even though it's gitignored, and generation is manual | ⚠️ Low |

---

## System overview

```
┌──────────────────────────── apps/studio (Sanity Studio v6, Vite) ────────────────────────────┐
│  structureTool ── Post form (Details)          writingRoom plugin (custom Tool, /writing-room)│
│        │  publish action wrapped by                 Lobby ── useDocuments / useCreateDocument │
│        │  withPostDetailsOnPublish                  Room  ── SDKPortableTextEditable (body)   │
│        │                                                     useEditDocument (title + slug)   │
│        │                                                     useApplyDocumentActions (publish)│
│        └──────────── shared: src/lib/{slug,publish-details,slug-availability} ───────────────┘│
└──────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                               │ Content Lake (project 3x95lfwz / production)
┌──────────────────────────── apps/web (Next.js 16, Cache Components) ─────────────────────────┐
│  defineLive(sanityFetch, SanityLive) · 'use cache' fetchers · perspective published|drafts   │
│  /api/draft-mode/enable ← Writing Room "Preview" (preview-url-secret)                        │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
packages/content  → shared Post rules (embed URL parsing)      packages/tokens → shared design tokens
```

---

## Decisions

### AD-1: A monorepo with a standalone Studio next to the Next.js app ✅

**Decision.** pnpm + Turborepo. `apps/studio` is a standalone Vite Studio, `apps/web` is the Reading Site, and `packages/content` and `packages/tokens` hold logic and tokens that both apps use.

**Against best practice.** This is the structure `nextjs.md` §1 and `project-structure.md` recommend: faster builds, TypeGen across apps, and a content model that isn't shaped around one website. Putting `parseEmbedUrl` in `@calm/content` so the Studio validator and the site renderer can't drift apart is a good use of the shared package.

**Consequences.**
- One rule lives in two places today. The API version is hard-coded in `apps/studio/src/lib/api-version.ts` and `apps/web/src/sanity/env.ts`, and a comment says to keep them "in step". It belongs in `@calm/content`.
- The project ID is hard-coded in `sanity.config.ts`, `sanity.cli.ts` and as a fallback in `web/src/sanity/env.ts`. Project IDs are public, so this is fine. If a second dataset is ever added, move the IDs to `SANITY_STUDIO_*` env vars.

---

### AD-2: Writing happens in a custom Studio Tool, not the document form (ADR 0001) ⚖️

**Decision.** The Writing Room is a `definePlugin` Tool with its own router (`/:postId`), a `write` intent, and an "Open in Writing Room" document action. Details stay in the standard form.

**Against best practice.** Sanity's guides usually point to custom inputs or Structure views. A full-screen Tool goes further than that, and ADR 0001 explains why: it is the only option that is truly full-screen while staying inside the Studio's auth, schema and deployment. The integration uses the supported extension points throughout: `tools`, `canHandleIntent`/`getIntentState`, `document.actions`, and `studio.components.navbar`.

**Trade-offs.**
- 👍 Total control over the writing surface. Only one deployable.
- 👎 Everything the form gives for free has to be rebuilt or deliberately left out: validation display, presence, comments, field-level history. That has already happened for validation (`publish-problems.ts` → `go-to-problem.ts`) and presence (`presence.ts`). **Comments and history are currently not available in the room.** That's fine, but it should be stated in ADR 0001.

---

### AD-3: The Writing Room syncs through the App SDK, inside the Studio (ADR 0003) ✅ / ⚠️

**Decision.** The body uses `SDKPortableTextEditable`. Title and slug use `useEditDocument`. The Lobby uses `useDocuments` and `useDocumentProjection`. Publishing uses `useApplyDocumentActions`. The editor schema comes from the Studio's `body` type through `@portabletext/sanity-bridge`.

**Against best practice (`app-sdk.md`).**
- ✅ Handles come first, and content loads per row (`useDocuments` → `PostRow` with `useDocumentProjection`), with a `<Suspense>` boundary around each row.
- ✅ `documentId` is used as the React `key` (`<Room key={postId}>`), so switching Posts remounts the room cleanly.
- ✅ Reads and writes go straight to Content Lake. There's no local mirror state, except in `useBlockField`, which debounces writes deliberately and documents why.
- ✅ Deriving the editor schema with `useBodySchema()` means the PTE and the Studio schema can't drift apart. This is a strong choice.

**⚠️ Two stores are involved in one decision.** `PublishButton` reads sync state from the SDK (`useDocumentSyncStatus`) but validation from the Studio (`useValidationStatus('drafts.<id>')`, which runs on the Studio document store). These are separate copies of the document. The SDK can report "synced" before the Studio store has picked up the change and re-validated. That's why the 4 s settle timeout exists, and it leads to F2.

**⚠️ Deployment coupling.** The App SDK inside the Studio requires a single SDK copy, which is why AD-4 exists.

---

### AD-4: Studio auto-updates are off ⚖️

**Decision.** `sanity.cli.ts` has `deployment.autoUpdates: false`. An auto-updating Studio loads `sanity` from the CDN while the app bundles its own `@sanity/sdk-react`, so the two never share a React context ("SanityInstance context not found").

**Against best practice.** `nextjs.md` §1 lists auto-updates as one of the main reasons to run a standalone Studio. Turning them off goes against that default, but the reason is real and written down next to the setting.

**Consequences.**
- Every Studio bugfix now needs a dependency bump and a redeploy. Plan a regular upgrade routine (the `sanity:sanity-studio-upgrade` skill produces a plan).
- ⚠️ **F4.** `sanity ^6.22.0` and `@sanity/sdk-react ^3.12.0` are independent caret ranges. If an install ends up with two SDK copies (for example `@portabletext/plugin-sdk-value` pulling in a different version), the room crashes again, and only in the deployed Studio. Add a guard: a CI step that fails when `pnpm why @sanity/sdk-react` reports more than one version, and a Renovate/Dependabot group that bumps `sanity`, `@sanity/sdk-react`, `@portabletext/editor` and `@portabletext/plugin-sdk-value` together.
- Revisit this when Sanity ships an SDK that shares context with an auto-updated Studio.

---

### AD-5: Content model — one `post` type, Prose/Details groups, and a named `body` array ✅ / ⚖️

**Decision.**
- `post` has Prose fields (`title`, `body`) and Details fields (`slug`, `excerpt`, `coverImage`, `publishedAt`, `tags`).
- `body` is a named top-level array type that allows `block`, `image`, `embed`, `codeBlock` and `sectionBreak`.

**Against best practice (`schema.md`).**
- ✅ `defineType`/`defineField`/`defineArrayMember` are used, icons come from per-icon subpaths, and `title` is left off where it would just repeat the name. Validation messages are written in the Writer's words.
- ✅ The model describes data, not presentation. `sectionBreak` is a "deliberate pause" rather than an `hr`, which passes the "would this survive a redesign?" test.
- ✅ Images use `hotspot: true` and have an `alt` field (`image.md` §1).
- ✅ Embeds are stored as URLs and parsed by a shared rule, never as raw iframes or file assets. This matches the global rule against serving video from `file` assets.
- ✅ The `link` annotation is limited to the `http`/`https`/`mailto` schemes.
- ⚖️ **`tags` is an array of strings, not references.** The decision matrix in `schema.md` §5 calls for references for a "shared taxonomy". Strings are simpler for one Writer, but you can't rename a tag across Posts or give it a description or page without a migration. Switch to a `tag` document before building tag pages.
- ⚖️ **There is no `author` reference.** The model assumes a single Writer. Presence already supports co-writing, so revisit this if bylines are ever needed.
- Minor: `tags.of` uses `{type: 'string'}` without `defineArrayMember` (`schema.md` §2).
- Minor: `sectionBreak.kind` is a hidden placeholder field, and the reason is documented. That's acceptable.

---

### AD-6: Only Prose is required, and Details are derived at publish time (ADR 0002) ✅ / ⚠️

**Decision.**
- Only `title`, `body` and body-image `alt` can produce an *error*. Every Detail is optional or a warning.
- The slug follows the title until the first publish (`followingSlug`). At publish time it's settled and made unique (`detailsForPublish`), and `publishedAt` is stamped.
- Both publish paths use the same logic: the room's `PublishButton` and the form's wrapped `publish` action (`withPostDetailsOnPublish`).

**Against best practice.**
- ✅ Wrapping the built-in publish action rather than replacing it keeps Sanity's behaviour (waiting for sync, validation gating, permissions). It's the same pattern Sanity documents for "set `publishedAt` on publish".
- ✅ The pure functions (`slugify`, `uniqueSlug`, `detailsForPublish`, `publishProblems`) are unit-tested and kept separate from React.

**⚠️ F1 — the built-in slug uniqueness check can break the ADR's rule (high, verify).** The `slug` type comes with a uniqueness validation. Its message, "Slug is already in use" (`slug.not-unique`), ships in Sanity's validation locale. The Writing Room checks validation **before** `detailsForPublish` runs. The likely sequence:

1. A Writer starts a second Post with the same title as an existing one.
2. While drafting, `followingSlug` sets the same slug.
3. The validation check reports an error on `slug`, a Detail.
4. `publishProblems` routes it to `details`, and the Writer gets sent out of the room to fix it.

That's exactly what ADR 0002 rules out, and `uniqueSlug` would have fixed it silently if it had got the chance to run.

*Confirm it:* create two Posts titled "Notes" and publish the second one from the room.

*Fix:* uniqueness is settled at publish time anyway, so take it out of blocking validation:

```ts
options: {source: 'title', maxLength: 96, isUnique: () => true},
validation: (rule) => rule.custom(async (slug, ctx) => /* same check as slugTakenByAnotherPost */).warning(),
```

**⚠️ F2 — publishing on timeout (medium).** `PublishButton` waits for "synced and not validating" but goes ahead after `SETTLE_TIMEOUT_MS = 4000` with whatever validation it has at that point. Content Lake doesn't enforce Studio validation, so a slow connection can publish a Post whose latest edit broke a rule, such as a body image with no `alt`. The Reading Site's fallbacks limit the damage. Still, it would be safer to keep the room calm by showing a "Still saving, try again in a moment" notice on timeout instead of publishing.

**⚠️ F5 — Content Release versions (low–medium).** `slugTakenByAnotherPost` excludes `$id` and `drafts.$id` but not `versions.<release>.$id`. If Content Releases are ever used, a Post's own release version would count as "another Post", and its slug would quietly become `-2`. Use `!sanity::versionOf($id)` in the filter (check the function against the current GROQ docs), or filter on `sanity::versionOf`/`_id` prefixes.

---

### AD-7: Reading Site data — `defineLive` + Cache Components ✅

**Decision.**
- `next-sanity` `defineLive` with `strict: true`, plus `cacheComponents: true` and `cacheLife: {default: sanity}`.
- Every `sanityFetch` runs inside a `'use cache'` function. Request-time values (draft mode, params) are read outside it and passed in.
- The client uses `useCdn: true` and `perspective: 'published'`.
- `<SanityLive>` is rendered in the root layout inside `<Suspense>`.

**Against best practice (`nextjs.md` §2–4).**
- ✅ Live Content API is the recommended default. Webhooks and manual tags aren't needed.
- ✅ `generateStaticParams` fetches `perspective: 'published', stega: false`, and so does `generateMetadata`. No stega characters end up in `<head>`.
- ✅ `notFound()` on missing Posts, and `defineQuery` everywhere so TypeGen can type the queries.
- ✅ Queries project only the fields they need, image queries ask for `lqip` + `dimensions` + `hotspot`/`crop` (`image.md` §4), and the PT body expands images with a conditional projection.
- Minor: the image projection is written out twice. Pull it into a fragment (`groq.md` §2).
- Minor: `POST_INDEX_QUERY` is unbounded and sorts by a computed value (`coalesce(publishedAt, _updatedAt)`), which can't use an index (`groq.md` §6). That's fine for a personal blog. Once the archive grows, add cursor pagination on `publishedAt, _id`. Since every published Post gets `publishedAt` at publish time (AD-6), you could drop the `coalesce`.

---

### AD-8: Preview is a draft-mode link, not the Presentation Tool or Visual Editing ⚖️

**Decision.** The room's **Preview** button creates a one-hour secret with `@sanity/preview-url-secret` and opens `/api/draft-mode/enable` on the Reading Site. The site then fetches with `perspective: 'drafts'` and a Viewer token, and `stega` stays `false`. A banner offers "Leave preview" through a form POST, so prefetching can't switch preview off by accident.

**Against best practice (`visual-editing.md`, `nextjs.md` §6).** The draft-mode route is the standard `defineEnableDraftMode` setup. Leaving out the Presentation Tool, overlays and stega is a deliberate product choice: the Writer edits in the room, and preview is only for reading. It also avoids the "clean stega before comparing" trap entirely.

**Consequences.**
- No click-to-edit from the site. If that's ever wanted, Presentation and stega would need adding, and any string compared in logic would need `stegaClean`.
- `SANITY_API_READ_TOKEN` is used as both `serverToken` and `browserToken`. `defineLive` only sends the browser token to the client while draft mode is on, so this is fine. Keep it a **Viewer** token.

---

### AD-9: Images — Sanity CDN as the only optimiser ✅

**Decision.** `next/image` uses a custom loader (`image-loader.ts`) that sets `w`/`q`/`auto=format` on a `@sanity/image-url` URL, so Next doesn't optimise images a second time. Hotspot becomes `object-position`, and LQIP becomes `blurDataURL`. In the Studio, the room builds CDN URLs by hand (`src/lib/image-url.ts`) and uploads with `client.assets.upload`.

**Against best practice (`image.md`).** ✅ Matches §3–5.

**Gaps.**
- The room's hand-written URL builder ignores crop. That's acceptable while editing, but `@sanity/image-url` is already in the dependency tree and would remove a regex that has to stay in sync with the asset-ID format.
- Images uploaded and then deleted from the body leave orphaned assets behind. Clean these up occasionally (for example with a GROQ query for `sanity.imageAsset` with no references) or ignore them.

---

### AD-10: TypeGen — run from the Studio, output committed in `web` ✅ / ⚠️

**Decision.** `sanity.cli.ts` `typegen` scans `../web/src/**` and writes `../web/src/sanity/types.ts` with `overloadClientMethods: true`. You run it by hand with `pnpm --filter studio typegen`. The generated types are committed, and `schema.json` is supposed to be ignored.

**Against best practice (`typegen.md`).** ✅ The cross-app config matches the guide's monorepo example. Committing the output is "Option A (recommended for most teams)".

**⚠️ F6.**
- `apps/studio/schema.json` is in `.gitignore` but **still tracked** (`git ls-files` lists it), so it will cause noisy diffs. Run `git rm --cached apps/studio/schema.json`.
- `typegen.enabled: true` isn't set, so types can drift until someone remembers to run the script. Turning it on regenerates types during `sanity dev`/`sanity build`. Alternatively, add a CI check that runs `typegen` and fails on a diff.
- Don't use `--enforce-required-fields`. Draft preview (AD-8) can return documents that fail validation, and the site already handles missing values.

---

### AD-11: Environments, tooling and per-Writer state ✅ / ⚠️

- **One `production` dataset.** This is simple, but schema experiments happen against live content. Add a `development` dataset, and point `sanity dev` at it through `SANITY_STUDIO_DATASET`, once more than one person changes the schema.
- **`visionTool()` ships to every Studio user in production.** Either limit it to development (`...(isDev ? [visionTool()] : [])`) or accept it as an admin convenience.
- **Room Settings live in `localStorage`, with an in-memory fallback.** This is correct: they're per-Writer conveniences, and the code survives blocked storage. They won't follow a Writer to another device. If that ever matters, they belong in a per-user document.
- **Empty drafts.** "Start a new Post" creates a document right away and discards it on Leave only if it's still empty. Closing the tab skips that cleanup, so empty drafts can pile up in Structure. A small scheduled cleanup (a Sanity Function on a schedule, or a script) would deal with it.
- **⚠️ F3 — ADRs aren't in the repo.** `.gitignore` excludes `docs/adr/` and `CONTEXT.md` as "local domain-modeling docs". But `post.ts`, `publish-details.ts` and `writing-room/index.ts` point readers to `docs/adr/000x-*.md`, which nobody who clones the repo will have. Either commit the ADRs (recommended, since they explain non-obvious constraints like "never add `.required()` to a Detail") or copy the key rules into the code comments.
- `apps/studio/README.md` is still the template boilerplate.

---

## Action items

**Fix now**
1. [ ] **F1** — Reproduce the duplicate-title publish from the room. If it's blocked, set `slug.options.isUnique: () => true` and add a custom uniqueness rule as a `.warning()`.
2. [ ] **F2** — On settle timeout, show a "still saving" notice instead of publishing on stale validation.
3. [ ] **F3** — Remove `docs/adr/` (and probably `CONTEXT.md`) from `.gitignore` and commit them, or move the essential rules into code comments.

**Guard rails**
4. [ ] **F4** — Add a CI check for a single `@sanity/sdk-react` copy, and group `sanity`/SDK/PTE bumps in Renovate.
5. [ ] **F6** — `git rm --cached apps/studio/schema.json`, and turn on `typegen.enabled` or add a CI diff check.
6. [ ] Move `API_VERSION` into `@calm/content` and import it everywhere. Since the plugin extraction there are three copies: the plugin, the Studio's seed script and the Reading Site.

**When the need comes up**
7. [ ] **F5** — Make the slug-availability query aware of releases before adopting Content Releases.
8. [ ] Switch `tags` to a `tag` document reference before building tag pages.
9. [ ] Add cursor pagination to the index query once the archive grows. Consider dropping the computed `coalesce` sort.
10. [ ] Add a `development` dataset, and limit Vision to development or admins.
11. [ ] Note in ADR 0001 that comments and history aren't available in the Writing Room.
12. [ ] Use `@sanity/image-url` for the room's image URLs instead of the hand-written builder.
