# Studio

Sanity Studio v6, configured with the Writing Room plugin (`sanity-plugin-writing-room`, in `packages/writing-room`).

- `sanity.config.ts` adds the plugin and registers its schema types: a `post` document and its `body` (Portable Text with images, embeds, code blocks and section breaks). The schema itself lives in `packages/writing-room/src/schema`.
- `writingRoomTheme` (from `sanity-plugin-writing-room/theme`) gives the rest of the Studio the Writing Room's paper, neutrals, accent and UI typeface.
- `src/lib/env.ts` reads the project, dataset and Reading Site URL from `.env.local`.
- `seed/` holds the sample Posts added by `pnpm seed`.

The plugin adds the Writing Room Tool, an "Open in Writing Room" action on Posts, and wraps the built-in Publish so a Post published from the form gets the same slug and date as one published from the room. See [its README](../../packages/writing-room/README.md).

Copy `.env.example` to `.env.local`, then run `pnpm dev` from the repo root. See the [root README](../../README.md) for setup and deployment, including why auto-updates are off.
