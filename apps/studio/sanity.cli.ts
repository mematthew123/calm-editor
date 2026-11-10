import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId} from './src/lib/env'

export default defineCliConfig({
  api: {projectId, dataset},
  vite: (config) => ({
    ...config,
    // Keep the dev server's dependency cache out of node_modules/.sanity, which `sanity build`
    // and `sanity deploy` clear: running either alongside `sanity dev` broke the dev server.
    cacheDir: 'node_modules/.vite-studio',
    resolve: {
      ...config.resolve,
      // The Writing Room is used from packages/writing-room/src, so its imports resolve from that
      // package's node_modules. pnpm can give it a different copy of these than the Studio's, and
      // two copies never share a React context ("SanityInstance context not found"). Resolve each
      // once, from here.
      dedupe: [
        ...(config.resolve?.dedupe ?? []),
        'sanity',
        'react',
        'react-dom',
        'styled-components',
        '@sanity/sdk-react',
        '@portabletext/editor',
      ],
    },
  }),
  typegen: {
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../web/src/sanity/types.ts',
    overloadClientMethods: true,
  },
  deployment: {
    /** Set after your first `sanity deploy`, so later deploys don't ask which Studio to update. */
    appId: process.env.SANITY_STUDIO_APP_ID,
    /**
     * Auto-updates are off on purpose. The Writing Room uses App SDK hooks (@sanity/sdk-react,
     * also via @portabletext/plugin-sdk-value). An auto-updating Studio loads `sanity` from the CDN
     * but bundles our copy of the SDK, so the two never share a React context and the room crashes
     * with "SanityInstance context not found". Bundling `sanity` keeps a single SDK copy.
     * To upgrade: bump `sanity` (and `@sanity/sdk-react` to match), then redeploy.
     */
    autoUpdates: false,
  },
})
