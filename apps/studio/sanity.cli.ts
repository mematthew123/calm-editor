import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '3x95lfwz',
    dataset: 'production'
  },
  typegen: {
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../web/src/sanity/types.ts',
    overloadClientMethods: true,
  },
  deployment: {
    appId: 'ho0oymafmx2yxful25a846tn',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
