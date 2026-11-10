# Roadmap: the Writing Room as an npm plugin

**Goal.** Publish the Writing Room as `sanity-plugin-writing-room`, a Sanity Studio plugin anyone can add to an existing Studio. The template (`apps/studio`) and zephyrpixels.dev (`mematthew123/new-zeph`) then consume it instead of keeping copies in sync by hand.

## Stage 1: extract the package (done)

- [x] Move the room (`src/writing-room` → `packages/writing-room/src/room`), the publish wrapper, its helpers (`slug`, `publish-details`, `slug-availability`, `image-url`) and the schema (`schemaTypes` → `src/schema`) into `packages/writing-room`. Tests moved with them.
- [x] Public API: `writingRoom(options)`, `writingRoomSchemaTypes`, and each schema type on its own.
- [x] The plugin owns the Publish wrapper (it was wired up in `sanity.config.ts`).
- [x] Config instead of env: `SANITY_STUDIO_READING_SITE_URL` is read by the template Studio and passed in as `preview.origin`. Without `preview`, the Preview button is hidden. The path (`/posts/<slug>`) and the draft-mode route are options too.
- [x] Design tokens are rendered as a `<style>` from `toCss()` instead of importing `tokens.css`, so consumers don't need a CSS loader for the plugin.
- [x] Build with tsdown to ESM + `.d.ts`. Dependencies and peers stay external; `@calm/content` and `@calm/tokens` are bundled. `publishConfig` points `exports` at `dist`, so the workspace uses `src` with no build step. `pnpm pack` produces a clean tarball.
- [x] Peers: `sanity`, `react`, `react-dom`, `styled-components`, `@sanity/sdk-react`, `@portabletext/editor` (the last two must be single copies shared with Sanity). `react` is `^19.3.1`, because `@portabletext/editor` 8.2.12 requires it.
- [x] Smoke test (`pnpm --filter sanity-plugin-writing-room smoke [version] [--loose]`): packs the plugin, installs it with npm into a fresh Studio, checks for a single copy of each shared package, type-checks the README's config and runs `sanity build`.
- [x] Install guide, requirements and Preview setup for Next.js and other frameworks in the package README.
- [x] The template Studio dedupes the packages it shares with the plugin (`resolve.dedupe` in `apps/studio/sanity.cli.ts`). Used from `src`, the plugin resolves from its own `node_modules`, and pnpm gave it a second `@sanity/sdk-react` and `sanity`, so the room crashed with "SanityInstance context not found". The smoke test missed it: an npm install of the tarball gets one copy.

## Stage 2: zero config in any Studio

**Goal.** The whole setup is `writingRoom({types: ['post', 'caseStudy']})`. The room reads everything else from the Studio's own schema: no schema to import, no fields to rename, no Structure to change. Options stay optional overrides for the unusual case. The one step left is `autoUpdates: false`, and only until Sanity lifts that limit (Stage 4).

**Acceptance test: Chipter's `post`** with nothing but `writingRoom({types: ['post']})`. Its body is `blockContent` (no embeds, code blocks or section breaks), it lives at `structure/blog;post`, and its image is `mainImage`. (`chipter` has a `writing-room-sandbox` branch with the plugin installed from a tarball.)

- [x] **Configurable document types.** `writingRoom({types: ['post', 'caseStudy']})`, ported from new-zeph's `WRITING_KINDS` and `room-route.ts`. Names come from each schema type's `title` (overridable with `title`/`pluralTitle`); the first type keeps `/writing-room/<id>`, others open at `/writing-room/<type>/<id>`; `preview.pathname` gets `(slug, type)`; slugs are unique per type.
- [x] **Find each type's fields.** Detect the title (`title`, or the field the type's preview uses), the body (the portable text field: `body` first, else the only one, else the first), the slug (a `slug` field) and the published date (`publishedAt`, else a datetime field whose name says published). A per-type `fields` override covers the rest. The room reads and writes through that map everywhere: title field, editor, word count, publish details, the empty check, publish problems, the Lobby. A type with no slug or no date still works; the room just doesn't settle what isn't there.
- [x] **The editor follows the document's own body type.** Build the editor's schema from the detected body field's type, not a global `body`. The insert menu, markdown shortcuts and selection bubble offer only what that type allows (styles, lists, decorators, links, block objects). Chipter gets headings, quotes, bullets, links and images; nothing it can't store. Image description and caption inputs only show when the image type has `alt`/`caption`. The empty-draft check ignores booleans and numbers, so a schema's initial values (`commentsEnabled: true`) don't stop an abandoned draft being discarded.
- [x] **The plugin registers its own block types, prefixed.** `writingRoomEmbed`, `writingRoomCodeBlock`, `writingRoomSectionBreak` (camelCase: dotted names are Sanity's own, like `sanity.imageAsset`), added by the plugin so they can't clash. A Studio opts in with `of: [{type: 'block'}, ...writingRoomBlocks]`. `writingRoomSchemaTypes` stays as an optional starter for Studios without a Post type, and keeps the unprefixed `embed`/`codeBlock`/`sectionBreak` so the template's and new-zeph's existing content stays valid; the room renders both names.
- [x] **Unknown blocks.** A block type the room doesn't know (a user's `callout`, `chipterScale`…) renders as a neutral placeholder the Writer can move or delete, with its fields one click away in Details.
- [x] **"All …" works with any Structure.** The link opens the type's most recently edited document through the `edit` intent, so the Structure tool lays out its list wherever the Studio keeps it (`structure/blog;post` in Chipter). Hidden when there are none. (Building the Studio's Structure ourselves needs `createStructureBuilder`, which is internal.)
- [x] **Cover image without naming it.** Detect the type's main image field (`coverImage`, `mainImage`, or the first image field outside the body) for the "Add a cover image" nudge, and use that field's title in the label.
- [x] **No per-Studio keys to set.** Room Settings use one plugin-wide key, `sanity-plugin-writing-room:settings` (reading the template's old `calm-editor:room-settings` once): they're the Writer's preferences, and storage is already per origin. Preview secrets need nothing: they live in each project's own dataset, and the source is only a label. new-zeph's overrides can go.
- [x] **Explain the auto-updates crash.** Catch "SanityInstance context not found" in the Tool and show what to change (`autoUpdates: false`) instead of the raw error.
- [x] **Say what Publish does.** Publishing from the room is a real publish, so webhooks and Functions fire (Chipter's `bluesky-post` cross-posts any `post` with `blueskyPost`). README note; no option unless someone needs one.

## Stage 3: look and feel in someone else's Studio

- [x] Fonts: shipped with the plugin. Newsreader (upright and a true italic, which the template never loaded) and Figtree, Latin and Latin Extended, inlined as data URLs in their own chunk (~230 KB) that loads when the room first opens; no CSS loader, no CDN. The template no longer installs `@fontsource-variable/*`.
- [x] `writingRoomTheme` and `createWritingRoomTheme({colors})` from `sanity-plugin-writing-room/theme`, with `@sanity/themer` as an optional peer. The entry point declares Figtree itself, so the Studio's text has it from the first screen. The template uses it; its own `theme.ts` is gone.
- [x] `writingRoom({colors: {light: {accent: '#2F6FA8'}}})` overrides any of the room's colours per scheme (typed as `WritingRoomColors`, checked against the tokens' palette at compile time).
- [x] Tokens no longer touch the rest of a Studio. They were on `:root` and `[data-scheme]`, which set `color-scheme` (scrollbars, native controls) for the whole Studio and matched Sanity UI elements that carry their own `data-scheme`. `toScopedCss()` sets them only on `[data-calm-surface]` and the room's portaled popovers (`[data-calm-floating]`).

## Stage 4: hardening

- [ ] Run the smoke test in CI against the declared minimum and `latest` of `sanity`.
- [ ] **Widen the `sanity` range?** Sanity 6.12.0 through 6.21.x pass the smoke test with `--loose` (6.12 is the first release on App SDK v3 and `@portabletext/editor` 8). 6.11 and older fail with a second SDK and editor copy. The smoke test can't open the room, so try writing, publishing and previewing in a Studio on 6.12 before lowering the peer from `^6.22.0`.
- [ ] A logged-in browser test of the room itself (needs a test project and a token in CI).
- [ ] Check an embedded Studio (`next-sanity`'s `NextStudio` in a Next.js app) as well as a standalone one.
- [ ] CI guard for a single `@sanity/sdk-react` (architecture review F4), in the smoke test's Studio *and* the template Studio's `sanity build` (count the "SanityInstance context not found" message in `dist`: it should appear once), and a test that fails if `sanity` and `@sanity/sdk-react` drift.
- [ ] Decide which `@portabletext/*` plugins should be peers rather than dependencies, once we see what duplicates in real installs.
- [ ] Revisit the auto-updates caveat whenever Sanity ships an SDK that shares context with an auto-updated Studio.

## Stage 5: release

- [ ] Publish `0.0.1` to hold the name.
- [ ] Version with Changesets; 0.x until Stage 2's API settles.
- [ ] Install docs shrink to: `npm install`, add `writingRoom({types: [...]})`, turn off auto-updates.
- [ ] GitHub Action: lint, typecheck, test, build, `pnpm pack`, then publish with npm provenance on release.
- [ ] README screenshot/GIF, and a Sanity Exchange listing.

## Stage 6: adopt it in new-zeph

- [ ] Replace new-zeph's `apps/studio/src/writing-room` copy with the npm package: `writingRoom({types: ['post', 'caseStudy'], preview: {…}})`, keeping its own schema.
- [ ] Drop the "a schema change must land in both repos" rule from new-zeph's CLAUDE.md once both Studios use the same package version.

## Decisions

- **Name: `sanity-plugin-writing-room`, unscoped.** It follows Sanity's `sanity-plugin-*` convention, so people find it on npm and the Sanity Exchange. Credit goes in `author`, the README and the Exchange listing rather than a scope. Publish a `0.0.1` early to hold the name.
- **Zero config is the goal.** Setup is the `types` list. Anything the room can read from the schema, it reads; options exist only to override what it detects. Decided 2026-11-09, after the Chipter sandbox needed a vendored tarball, imported block types, a sandbox type and a Structure change.
- **Schema: the plugin never registers your names.** It doesn't add `post` or `body`; it works with the document types you already have. It does register its own block types, prefixed `writingRoom…` (`writingRoomEmbed`), so they can't clash. `writingRoomSchemaTypes` is an optional starter you register yourself. (Replaces "users register the schema themselves", which asked every Studio to add our `body`.)
