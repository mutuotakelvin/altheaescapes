import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'cxo16e4x',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  typegen: {
    path: '../althea-web/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../althea-web/sanity.types.ts',
    overloadClientMethods: true,
  },
})
