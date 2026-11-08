# Reading Site

The public site where readers read published Posts. It shares its typography and colour with the Writing Room through `@calm/tokens`.

Next.js 16 with Cache Components and Sanity's Live Content API (`next-sanity` `defineLive`):

- `src/sanity/` holds the client, queries (`defineQuery`, typed by TypeGen), live fetching and the image loader.
- `src/app/api/draft-mode/` is where the Writing Room's **Preview** button lands.
- `src/app/api/revalidate/` is called by the publish webhook.

Copy `.env.example` to `.env.local`, then run `pnpm dev` from the repo root. See the [root README](../../README.md) for setup and deployment.
