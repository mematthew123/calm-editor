# Releasing sanity-plugin-writing-room

The plugin is the only package this repo publishes; the template's apps and `@calm/*` packages are private. Versions are managed with [Changesets](https://changesets.dev), and stay 0.x until the API settles.

## Day to day

1. In a pull request that changes the plugin, run `pnpm changeset`, pick `sanity-plugin-writing-room`, choose **patch** (fixes) or **minor** (features, and anything breaking while we're on 0.x), and write one line for the changelog. Commit the file it creates in `.changeset/`.
2. When that lands on `main`, the **Release** workflow opens (or updates) a pull request called **Release sanity-plugin-writing-room**, which bumps the version and writes `CHANGELOG.md`.
3. Merging that pull request publishes the new version to npm, with provenance, and tags it.

## Publishing the first version (once)

npm can only trust a workflow for a package that already exists, so `0.0.1` is published by hand, from `packages/writing-room` on an up-to-date `main`:

```sh
npm login
pnpm publish --access public
```

npm asks for your one-time password (2FA). Use `pnpm publish`, not `npm publish`: pnpm applies `publishConfig`, which points `exports` at `dist` instead of `src`. The `prepack` script builds `dist` first. To see exactly what would be published: `pnpm pack` and look inside the tarball.

## Letting the workflow publish (once)

The workflow publishes with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers): GitHub proves to npm which repository and workflow is publishing, so no npm token is stored anywhere, and npm adds a provenance statement to each version. It needs pnpm 11.1.3 or newer (this repo pins pnpm 11 in `packageManager`).

1. On npmjs.com, open the package's **Settings**, and under **Trusted Publisher** choose **GitHub Actions**: user `mematthew123`, repository `calm-editor`, workflow `release.yml`, no environment.
2. In the same settings, set **Publishing access** to **Require two-factor authentication and disallow tokens**. Trusted publishing keeps working; tokens can no longer publish.
3. In the GitHub repository's settings (Secrets and variables → Actions → Variables), add the variable **`NPM_PUBLISH`** with the value `true`.
4. In **Actions → General**, tick **Allow GitHub Actions to create and approve pull requests**, so the workflow can open the release pull request.
5. Delete the `NPM_TOKEN` secret and revoke that token on npmjs.com if you made one: nothing uses it.

Until `NPM_PUBLISH` is `true`, the workflow still opens the release pull request but never publishes, so nothing fails while npm isn't set up.

### Why not a token?

npm is phasing out tokens that publish without 2FA: since 31 July 2026 they can't manage packages, and GitHub is [targeting January 2027](https://github.blog/changelog/2026-07-31-restricting-npm-bypass-2fa-granular-access-tokens) for removing their direct publish. An ordinary token can't publish from CI at all when the account has 2FA, because npm asks for a one-time password (`ERR_PNPM_OTP_NON_INTERACTIVE`).
