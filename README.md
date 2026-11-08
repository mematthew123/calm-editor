# Writing Room

A calm, full-screen place to write long-form Posts and Case Studies inside Sanity Studio, and a Reading Site that shares its typography and colour.

<!-- TODO: add a 1200×750 screenshot or GIF of the Writing Room (also used for the Exchange listing). -->

Most Studios put writing in a form: panes, field labels and a toolbar around every sentence. This template adds a **Writing Room**: a Studio Tool with its own route that shows only a Post's title and body, and gets out of the way while you type. Everything else about a Post (slug, excerpt, cover image, tags) stays in the standard form, one click away.

A **Case Study** is written the same way. It shares a Post's Prose and Details (its cover image is the hero, its tags are the technologies used) and adds a client, a service and a short summary for its header.

## What's in the room

- **The Lobby**: start a new Post or Case Study, or pick up recent work.
- **Controls that recede**: Leave, Details, Preview, Publish and save state fade after a few keystrokes and return when you pause.
- **Formatting on selection**: bold, italic, headings, quotes and links in a small bubble above selected text.
- **An insert menu**: type `+` or `/` on an empty line for images, embeds (YouTube, Vimeo, Spotify), code blocks, section breaks, quotes and lists.
- **Markdown as you type**: `##`, `>`, `-`, `1.`, `---` and code fences.
- **Room settings**: text size, typewriter scrolling and focus dimming, kept per Writer in the browser.
- **Live sync and presence** through the Sanity App SDK. The room says when you're offline and keeps your words until you're back.
- **Publish from the room**: the slug is settled and the date stamped for you. If something blocks the publish, the room takes you straight to it.
- **Preview** opens the Post or Case Study on the Reading Site in draft mode, exactly as readers will see it.

The **Reading Site** is a Next.js 16 app that uses the Live Content API and Cache Components. It renders Posts (at `/posts/…`) and Case Studies (at `/case-studies/…`) in the same Newsreader/Figtree typography and warm palette as the room, with fallbacks for any Details a Writer leaves empty.

## What's inside

```
apps/
  studio/      Sanity Studio v6, with the Writing Room in src/writing-room
  web/         The Reading Site (Next.js 16, Tailwind CSS 4)
packages/
  content/     Rules shared by both apps (the kinds of writing and their paths, parsing embed URLs)
  tokens/      Design tokens (src/index.ts), mirrored in DESIGN.md
```

It's a pnpm + Turborepo monorepo. `DESIGN.md` is the design system.

## Getting started

You'll need Node 22.12 or newer (Sanity Studio v6 requires it), pnpm 11 and a free [Sanity account](https://www.sanity.io/get-started).

### 1. Create a project

```sh
git clone https://github.com/<you>/writing-room.git
cd writing-room
pnpm install
```

Create a Sanity project (or use an existing one) at [sanity.io/manage](https://www.sanity.io/manage), or run `pnpm dlx sanity@latest init --bare` from `apps/studio`.

### 2. Add environment variables

```sh
cp apps/studio/.env.example apps/studio/.env.local
cp apps/web/.env.example apps/web/.env.local
```

| Variable | App | What it's for |
|---|---|---|
| `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` | studio | The project and dataset the Studio edits |
| `SANITY_STUDIO_READING_SITE_URL` | studio | Where **Preview** opens Posts and Case Studies (default `http://localhost:3000`) |
| `SANITY_STUDIO_APP_ID` | studio | Optional. The Studio's app ID, printed after your first deploy |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | web | The same project and dataset |
| `NEXT_PUBLIC_SITE_URL` | web | Optional. Your site's URL, for metadata. On Vercel this is detected automatically |
| `SANITY_API_READ_TOKEN` | web | A **Viewer** token (Manage → API → Tokens). Used only to read drafts while previewing |
| `SANITY_REVALIDATE_SECRET` | web | Shared secret for the publish webhook (see below) |

### 3. Add sample Posts (optional)

```sh
pnpm seed
```

This adds three published sample Posts. Running it again leaves existing ones alone.

### 4. Run it

```sh
pnpm dev
```

- Studio: <http://localhost:3333>. Open **Writing Room** from the navigation.
- Reading Site: <http://localhost:3000>

In your project's API settings, add `http://localhost:3000` as a CORS origin with **Allow credentials** turned on, so the Reading Site can receive live updates and read drafts while previewing. Add your production URL the same way when you deploy.

## Deploying

**Studio.** Run `pnpm --filter studio deploy`. Set `SANITY_STUDIO_READING_SITE_URL` to your Reading Site's URL first, for example in `apps/studio/.env.production.local`.

> **Auto-updates are off, on purpose.** The Writing Room uses the App SDK (`@sanity/sdk-react`). An auto-updating Studio loads `sanity` from a CDN but bundles its own copy of the SDK, and the two never share a React context, so the room crashes with "SanityInstance context not found". To upgrade, bump `sanity` and `@sanity/sdk-react` together, then redeploy. See `apps/studio/sanity.cli.ts`.

**Reading Site.** Deploy `apps/web` to Vercel (set the project's root directory to `apps/web`) or any Next.js host, with the environment variables above.

**Publish webhook.** `<SanityLive>` refreshes pages for readers who have the site open. For everyone else, add a webhook in Manage → API → Webhooks:

- URL: `https://<your-site>/api/revalidate`
- Trigger on: create, update and delete
- Filter: `_type in ["post", "caseStudy"]`
- Secret: the same value as `SANITY_REVALIDATE_SECRET`

## Making it yours

- **Look and feel.** The colours and type scale live in `packages/tokens/src/index.ts`. Change them there, run `pnpm --filter @calm/tokens build` to regenerate `packages/tokens/tokens.css` (which both apps use), then update the front matter in `DESIGN.md` to match. A test fails if the two drift apart.
- **Content model.** `apps/studio/schemaTypes`. Fields every kind of writing shares live in `documents/writing-fields.ts`; to add another kind, define its type there alongside `post` and `caseStudy`, add it to `WRITING_KINDS` in `packages/content/src/kinds.ts`, and give the Reading Site a route at its `path`. The Writing Room's editor reads the `body` type directly, so blocks you add there appear in the room. Give each new block a renderer in `src/writing-room/editor/nodes.tsx` and the Reading Site's `Prose` component.
- **One rule to keep.** Only Prose (title, body, and alt text on body images) may *block* a publish, because the Writer can't fix anything else from inside the room. Every Detail is optional, or at most a warning, and the Reading Site supplies a fallback when one is empty.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the Studio and the Reading Site |
| `pnpm build` / `pnpm typecheck` / `pnpm lint` / `pnpm test` | Across every package |
| `pnpm seed` | Adds the sample Posts |
| `pnpm --filter studio typegen` | Regenerates the Reading Site's query types from the schema |
| `pnpm validate` | Checks the repo against Sanity's template requirements |

## License

[MIT](LICENSE)
