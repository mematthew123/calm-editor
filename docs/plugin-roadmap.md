# Roadmap: the Writing Room as an npm plugin

The plugin moved to its own repository on 2026-11-10: **[mematthew123/sanity-plugin-writing-room](https://github.com/mematthew123/sanity-plugin-writing-room)**. Its roadmap is [ROADMAP.md](https://github.com/mematthew123/sanity-plugin-writing-room/blob/main/ROADMAP.md) there.

## How it got there

1. **Extracted** from `apps/studio/src/writing-room` into `packages/writing-room` and published as `sanity-plugin-writing-room` (`0.0.1` by hand, `0.0.2` from this repository's CI with npm trusted publishing).
2. **Zero config** in any Studio, its look self-contained, CI and a smoke test, Changesets, all while it lived here (PRs #7–#17).
3. **Moved out** ([`plugin-split-plan.md`](plugin-split-plan.md)): its own public repository, so it has provenance and working links, and `0.1.0` was published from there. This template now installs it from npm.

The design tokens and embed parsing exist in both places now: `packages/tokens` and `packages/content` here (for the Reading Site), and `src/tokens.ts` and `src/embed.ts` in the plugin. Change both.
