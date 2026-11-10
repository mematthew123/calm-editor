import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {writingRoom, writingRoomSchemaTypes} from 'sanity-plugin-writing-room'
import {writingRoomTheme} from 'sanity-plugin-writing-room/theme'
import {structureTool} from 'sanity/structure'
import {dataset, projectId, readingSiteUrl} from './src/lib/env'

export default defineConfig({
  name: 'default',
  title: 'Calm Editor',

  projectId,
  dataset,

  plugins: [structureTool(), writingRoom({preview: {origin: readingSiteUrl}}), visionTool()],

  theme: writingRoomTheme,

  schema: {
    types: writingRoomSchemaTypes,
  },
})
