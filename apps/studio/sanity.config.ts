import '@fontsource-variable/figtree'
import '@fontsource-variable/newsreader'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {withPostDetailsOnPublish} from './src/actions/publish-post'
import {dataset, projectId} from './src/lib/env'
import {theme} from './src/theme'
import {writingRoom} from './src/writing-room'

export default defineConfig({
  name: 'default',
  title: 'Calm Editor',

  projectId,
  dataset,

  plugins: [structureTool(), writingRoom(), visionTool()],

  theme,

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) =>
      context.schemaType === 'post'
        ? prev.map((action) =>
            action.action === 'publish' ? withPostDetailsOnPublish(action, context) : action,
          )
        : prev,
  },
})
