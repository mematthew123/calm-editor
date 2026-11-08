# Studio

Sanity Studio v6, with the Writing Room in `src/writing-room`.

- `schemaTypes/` is the content model: a `post` document and its `body` (Portable Text with images, embeds, code blocks and section breaks).
- `src/writing-room/` is the Writing Room Tool: the Lobby, the room, and its editor (built on `@portabletext/editor`, synced through the App SDK).
- `src/actions/` wraps the built-in Publish so a Post published from the form gets the same slug and date as one published from the room.
- `seed/` holds the sample Posts added by `pnpm seed`.

Copy `.env.example` to `.env.local`, then run `pnpm dev` from the repo root. See the [root README](../../README.md) for setup and deployment, including why auto-updates are off.
