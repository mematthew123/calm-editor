# Roadmap: the Writing Room as an npm plugin

**Goal.** Publish the Writing Room as `sanity-plugin-writing-room`, a Sanity Studio plugin anyone can add to an existing Studio. The template (`apps/studio`) and zephyrpixels.dev (`mematthew123/new-zeph`) then consume it instead of keeping copies in sync by hand.

## Stage 1: extract the package (done on this branch)

- [x] Move the room (`src/writing-room` → `packages/writing-room/src/room`), the publish wrapper, its helpers (`slug`, `publish-details`, `slug-availability`, `image-url`) and the schema (`schemaTypes` → `src/schema`) into `packages/writing-room`. Tests moved with them.
- [x] Public API: `writingRoom(options)`, `writingRoomSchemaTypes`, and each schema type on its own.
- [x] The plugin owns the Publish wrapper (it was wired up in `sanity.config.ts`).
- [x] Config instead of env: `SANITY_STUDIO_READING_SITE_URL` is read by the template Studio and passed in as `preview.origin`. Without `preview`, the Preview button is hidden. The path (`/posts/<slug>`) and the draft-mode route are options too.
- [x] Design tokens are rendered as a `<style>` from `toCss()` instead of importing `tokens.css`, so consumers don't need a CSS loader for the plugin.
- [x] Build with tsdown to ESM + `.d.ts`. Dependencies and peers stay external; `@calm/content` and `@calm/tokens` are bundled. `publishConfig` points `exports` at `dist`, so the workspace uses `src` with no build step. `pnpm pack` produces a clean tarball.
- [x] Peers: `sanity`, `react`, `react-dom`, `styled-components`, `@sanity/sdk-react`, `@portabletext/editor` (the last two must be single copies shared with Sanity).

## Stage 2: fit other content models

- [ ] **Configurable document types.** `post` is still hard-coded in the plugin (tool intent, Lobby, Room handle, validation, navigation, slug query). new-zeph already generalised this for Posts + Case Studies with `WRITING_KINDS` in its `@calm/content` and `room-route.ts`. Port that here as an option, e.g. `types: [{type: 'post', path: (slug) => '/blog/' + slug}, {type: 'caseStudy', …}]`, keeping `/writing-room/<id>` working for Posts.
- [ ] **Bring your own schema.** Document the contract (`title`, `body`, `slug`, `publishedAt`) and offer a helper that adds the room's fields to a user's document type, instead of only shipping our `post`.
- [ ] **Name clashes.** `body` is a common type name. Make the body type name an option (the stored `_type`s of blocks, `embed`/`codeBlock`/`sectionBreak`, must stay as they are, or existing content needs a migration).
- [ ] Unknown block types in a user's `body`: render a neutral placeholder rather than failing.
- [ ] Per-Studio storage key for Room Settings and preview-secret source (new-zeph overrides both today).

## Stage 3: look and feel in someone else's Studio

- [ ] Fonts: decide between documenting them (now) and shipping them (font files in the package, or an opt-in `fonts: true`).
- [ ] Export the Studio theme (`apps/studio/src/theme.ts`) as an optional `writingRoomTheme`, with `@sanity/themer` as an optional peer.
- [ ] Let consumers override tokens (accent, paper) without forking.
- [ ] Check the `--calm-*` custom properties can't leak into or clash with the rest of a Studio (they're set on `:root` today).

## Stage 4: hardening

- [ ] Smoke test against a fresh `sanity init` Studio from the packed tarball, not just the workspace.
- [ ] CI guard for a single `@sanity/sdk-react` (architecture review F4), and a test that fails if `sanity` and `@sanity/sdk-react` drift.
- [ ] Decide which `@portabletext/*` plugins should be peers rather than dependencies, once we see what duplicates in real installs.
- [ ] Revisit the auto-updates caveat whenever Sanity ships an SDK that shares context with an auto-updated Studio.

## Stage 5: release

- [ ] Version with Changesets; 0.x until Stage 2's API settles.
- [ ] GitHub Action: lint, typecheck, test, build, `pnpm pack`, then publish with npm provenance on release.
- [ ] README screenshot/GIF, and a Sanity Exchange listing.

## Stage 6: adopt it in new-zeph

- [ ] Replace new-zeph's `apps/studio/src/writing-room` copy with the npm package and its options (`/blog` path, Case Studies, storage key).
- [ ] Drop the "a schema change must land in both repos" rule from new-zeph's CLAUDE.md once both Studios use the same package version.

## Open questions

- **Name.** `sanity-plugin-writing-room` is free on npm and follows Sanity's naming convention. A scope (e.g. `@zephyrpixels/sanity-plugin-writing-room`) is the alternative.
- **Schema ownership.** Should the plugin register its schema types itself (zero setup, but clashes are likelier), or keep asking users to add `writingRoomSchemaTypes` (today)?
