import '@fontsource-variable/figtree'
import '@fontsource-variable/newsreader'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {withPostDetailsOnPublish} from './src/actions/publish-post'
import {theme} from './src/theme'

export default defineConfig({
  name: 'default',
  title: 'Calm Editor',

  projectId: '3x95lfwz',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

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
