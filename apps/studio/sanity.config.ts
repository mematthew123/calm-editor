import '@fontsource-variable/figtree'
import '@fontsource-variable/newsreader'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {writingRoom, writingRoomSchemaTypes} from 'sanity-plugin-writing-room'
import {structureTool} from 'sanity/structure'
import {dataset, projectId, readingSiteUrl} from './src/lib/env'
import {theme} from './src/theme'

export default defineConfig({
  name: 'default',
  title: 'Calm Editor',

  projectId,
  dataset,

  plugins: [structureTool(), writingRoom({preview: {origin: readingSiteUrl}}), visionTool()],

  theme,

  schema: {
    types: writingRoomSchemaTypes,
  },
})
