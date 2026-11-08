import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

/**
 * A Post. Only Prose (title, body) may block publishing; every Detail is optional
 * and the Reading Site supplies a fallback. Read docs/adr/0002-only-prose-is-required-to-publish.md
 * before adding required validation to anything in the `details` group.
 */
export const post = defineType({
  name: 'post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'prose', title: 'Prose', default: true},
    {name: 'details', title: 'Details'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'prose',
      validation: (rule) => rule.required().error('Every Post needs a title.'),
    }),
    defineField({
      name: 'body',
      type: 'body',
      group: 'prose',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'details',
      description: 'Follows the title until the Post is first published, then stays put.',
      options: {source: 'title', maxLength: 96},
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'details',
      description:
        'A sentence or two for previews and social cards. Leave empty to use the opening of the Post.',
      validation: (rule) =>
        rule.max(200).warning('Short excerpts read best: aim for under 200 characters.'),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      group: 'details',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Description',
          type: 'string',
          description: 'Describe this image for people who can’t see it.',
          validation: (rule) =>
            rule.custom((alt, context) => {
              const image = context.parent as {asset?: unknown} | undefined
              if (!image?.asset || alt?.trim()) return true
              return 'A description helps people who can’t see the image.'
            }).warning(),
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      group: 'details',
      description: 'Set automatically the first time this Post is published. Change it to backdate.',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      group: 'details',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      validation: (rule) => rule.unique(),
    }),
  ],
  orderings: [
    {
      title: 'Recently published',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', media: 'coverImage', excerpt: 'excerpt'},
    prepare: ({title, media, excerpt}) => ({
      title: title || 'Untitled',
      subtitle: excerpt,
      media,
    }),
  },
})
