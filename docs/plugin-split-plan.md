# Plan: move the plugin into its own repository

**Goal.** `sanity-plugin-writing-room` lives in its own public repository, and Calm Editor installs it from npm, the same as any other Studio. Calm Editor can then stay private.

**Status:** done, 2026-11-10.

- **Phase 1:** [mematthew123/sanity-plugin-writing-room](https://github.com/mematthew123/sanity-plugin-writing-room) is public, with the plugin's history from the extraction, the copied tokens and embed code, CI and the release workflow.
- **Phase 2:** Calm Editor stopped publishing (#18); npm's trusted publisher moved to the new repository, which published `0.1.0` with provenance.
- **Phase 3:** Calm Editor installs `sanity-plugin-writing-room@^0.1.0` from npm; `packages/writing-room`, its smoke test and the `resolve.dedupe` workaround are gone.
- **Phase 4** (follow-ups) is still open.

## Where things stand

- The plugin is `packages/writing-room`, published to npm as `sanity-plugin-writing-room` (0.0.1 by hand, 0.0.2 by CI with trusted publishing). Its CI, release workflow, Changesets and smoke test already cover only the plugin.
- It bundles two private workspace packages into `dist`:
  - `@calm/tokens`: `palette`, `fonts`, `toScopedCss` (design tokens; also feeds the Reading Site through `tokens.css`).
  - `@calm/content`: `parseEmbedUrl`, `embedPlayerUrl`, `EMBED_PROVIDER_NAMES` (embed links; the Reading Site uses them too).
- Its `tsconfig.json` doesn't extend anything at the root, so it builds on its own.
- Its history is clean: the only project ID is the smoke test's placeholder `abc12345`, and there are no tokens or keys. Commits carry the author email `mematthew123@gmail.com`, which is public on npm already.
- Calm Editor's repository is private, so npm can't attach provenance and the package's GitHub links 404 for everyone else. That's the reason for the split.

## Decisions to confirm

| | Recommendation | Alternative |
|---|---|---|
| Repository | `mematthew123/sanity-plugin-writing-room`, public | another name or owner |
| History | Keep it from the extraction (`1c92809`) onward with `git filter-repo --subdirectory-filter packages/writing-room` (about 11 commits). Earlier history stays in Calm Editor. | Full history back to `apps/studio/src/writing-room`, with path renames: more work and touches Studio files, for commits nobody outside will need |
| Tokens and embeds | Copy them into the plugin (`src/tokens.ts`, `src/embed.ts`), so it has no private dependencies. Calm Editor keeps its own `@calm/tokens` and `@calm/content` for the Reading Site. | Publish `@calm/tokens` and `@calm/content` to npm: more packages to release for code only two projects share |
| First release from the new repo | `0.1.0` (minor): new home, same API | `0.0.3` |

**What we give up:** one source of truth for the design tokens. The plugin and the Reading Site each keep a copy, and the test that checks `DESIGN.md` against the tokens stays in Calm Editor only. If the room's colours change, change both.

## Phase 1: create the plugin repository

1. Make a fresh clone of Calm Editor and run `git filter-repo --subdirectory-filter packages/writing-room`, so the plugin's files sit at the root and keep their history.
2. Copy `@calm/tokens/src/index.ts` → `src/tokens.ts` and `@calm/content/src/embed.ts` → `src/embed.ts`, with their tests. Point the six imports at them, drop the two `workspace:*` dev dependencies, and drop the `DESIGN.md` test (it reads a file this repo won't have).
3. Make it a standalone pnpm project:
   - `package.json` gets `packageManager` (`pnpm@11.18.0`) and `engines`, and its `repository`, `homepage` and `bugs` point at the new repository (no `directory`).
   - Add a `pnpm-lock.yaml` and a `.gitignore`.
   - Move `.changeset/` here with `repo` set to the new repository, and add `@changesets/cli` and `@changesets/changelog-github`.
4. Bring the workflows over with the plugin's paths:
   - `ci.yml`: typecheck, test, lint and build, plus the smoke test on `sanity@6.22.0`, and on `latest` with `--embedded`.
   - `release.yml`: unchanged except its filters.
5. Update the docs:
   - README links point at the new repository, and the "comes from the Calm Editor template" note goes.
   - The CHANGELOG stays as it is.
   - Move `docs/releasing.md` and the plugin-relevant parts of `docs/plugin-roadmap.md` (the open Stage 2–6 items, the decisions) into the repository.
6. Check it from a clean clone:
   - `pnpm install`, test, typecheck, lint, build and smoke all pass.
   - `pnpm pack` contains the same `dist` files as `0.0.2` (same exports and entry points).

## Phase 2: hand the npm package over

Order matters: only one repository should be able to publish at a time.

1. Calm Editor: delete `.github/workflows/release.yml` and `.changeset/`, so it can't publish any more.
2. npmjs.com, the package's Settings → Trusted Publisher: change the repository to `sanity-plugin-writing-room` (still `release.yml`, no environment, allowed to publish).
3. In the new repository's settings:
   - Actions → General: tick **Allow GitHub Actions to create and approve pull requests**.
   - Add the variable `NPM_PUBLISH=true`.
4. Add a changeset ("The plugin now lives in its own repository…") and merge the release PR it opens. That publishes `0.1.0` from the public repository, the first release with **provenance**, and with working links on npm.
5. Check:
   - `npm view sanity-plugin-writing-room` shows `0.1.0`.
   - The attestations endpoint lists a provenance statement.
   - A clean Studio installs it and builds with one SDK copy.

## Phase 3: Calm Editor installs it from npm

1. `apps/studio`: `sanity-plugin-writing-room` becomes `^0.1.0` (from npm). Drop the unused `@calm/tokens` dependency.
2. Remove `packages/writing-room` and the plugin's smoke-test jobs from `ci.yml`. Calm Editor's CI keeps typecheck, test, lint and build.
3. `sanity.cli.ts`: remove the `resolve.dedupe` workaround, since an installed plugin resolves Sanity's copies like any Studio's. Keep `check-single-sdk.mjs` in the build, because it still guards deploys.
4. Docs:
   - The root README links to the plugin's repository.
   - `docs/releasing.md` moves out.
   - `docs/plugin-roadmap.md` becomes a pointer to the new repository, keeping a short history of the extraction.
5. Check:
   - `pnpm install` and all checks pass.
   - The Studio's build reports one SDK copy.
   - The room opens in `pnpm dev`.

## Phase 4: follow-ups

- Chipter sandbox: replace the vendored tarball with `sanity-plugin-writing-room@^0.1.0`.
- Deprecate the `0.0.0-stage` placeholder on npm; revoke the old npm token and delete `NPM_TOKEN` from Calm Editor.
- Roadmap Stage 6 (new-zeph) and the Sanity Exchange listing, both now pointing at the public repository.
- Close Calm Editor PR #6, which is superseded.

## Who does what

| Step | Who |
|---|---|
| Create the empty public repository on GitHub | You (or Claude with `gh repo create`, if you say so) |
| Phase 1 and Phase 3 code, docs and pull requests | Claude |
| npm trusted publisher, repository settings, `NPM_PUBLISH` | You |
| Merging the release PR that publishes `0.1.0` | You decide; Claude can merge on your word |
