import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineType} from 'sanity'
import {WRITING_KINDS} from '@calm/content'
import {
  proseFields,
  PUBLISHED_AT_DESC,
  sharedDetailFields,
  slugField,
  WRITING_GROUPS,
} from './writing-fields'

/**
 * A Post. Only Prose (title, body) may block publishing; every Detail is optional
 * and the Reading Site supplies a fallback. Writers publish from the Writing Room, which can't
 * show Details, so a required Detail would block a publish they can't fix from where they are.
 * Don't add required validation to anything in the `details` group without giving the room a
 * way to resolve it in place.
 */
export const post = defineType({
  name: 'post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: WRITING_GROUPS,
  fields: [
    ...proseFields(WRITING_KINDS.post),
    slugField(WRITING_KINDS.post),
    ...sharedDetailFields(WRITING_KINDS.post),
  ],
  orderings: [PUBLISHED_AT_DESC],
  preview: {
    select: {title: 'title', media: 'coverImage', excerpt: 'excerpt'},
    prepare: ({title, media, excerpt}) => ({
      title: title || 'Untitled',
      subtitle: excerpt,
      media,
    }),
  },
})
