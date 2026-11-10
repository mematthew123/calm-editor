# Releasing sanity-plugin-writing-room

The plugin is the only package this repo publishes; the template's apps and `@calm/*` packages are private. Versions are managed with [Changesets](https://changesets.dev), and stay 0.x until the API settles.

## Day to day

1. In a pull request that changes the plugin, run `pnpm changeset`, pick `sanity-plugin-writing-room`, choose **patch** (fixes) or **minor** (features, and anything breaking while we're on 0.x), and write one line for the changelog. Commit the file it creates in `.changeset/`.
2. When that lands on `main`, the **Release** workflow opens (or updates) a pull request called **Release sanity-plugin-writing-room**, which bumps the version and writes `CHANGELOG.md`.
3. Merging that pull request publishes the new version to npm, with provenance, and tags it.

## Publishing the first version (once)

`0.0.1` holds the name. Publish it by hand, from `packages/writing-room` on an up-to-date `main`:

```sh
npm login
pnpm publish --access public
```

Use `pnpm publish`, not `npm publish`: pnpm applies `publishConfig`, which points `exports` at `dist` instead of `src`. The `prepack` script builds `dist` first. To see exactly what would be published: `pnpm pack` and look inside the tarball.

## Letting the workflow publish (once)

1. On npmjs.com, create a **granular access token** with read and write access to `sanity-plugin-writing-room` only.
2. In the GitHub repository's settings, add it as the secret **`NPM_TOKEN`** (Secrets and variables → Actions → Secrets).
3. Add the repository variable **`NPM_PUBLISH`** with the value `true` (same page → Variables).

Until `NPM_PUBLISH` is `true`, the workflow still opens the release pull request but never publishes, so nothing fails while npm isn't set up.
