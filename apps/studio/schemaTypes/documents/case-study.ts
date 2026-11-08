import {CaseIcon} from '@sanity/icons/Case'
import {defineField, defineType} from 'sanity'
import {WRITING_KINDS} from '@calm/content'
import {
  proseFields,
  PUBLISHED_AT_DESC,
  seoFields,
  sharedDetailFields,
  slugField,
  WRITING_GROUPS,
} from './writing-fields'

/**
 * A Case Study: the story of one piece of client work, written in the Writing Room like a Post.
 * It shares a Post's Prose and Details (the cover image is the hero, tags are the technologies
 * used) and adds who it was for, what was done, and a short summary for the header.
 *
 * As with Posts, only Prose may block publishing; every Detail here is optional.
 */
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  icon: CaseIcon,
  groups: WRITING_GROUPS,
  fields: [
    ...proseFields(WRITING_KINDS.caseStudy),
    slugField(WRITING_KINDS.caseStudy),
    defineField({
      name: 'client',
      type: 'string',
      group: 'details',
      description: 'Who the work was for, e.g. “Montana Wildlife Federation”.',
    }),
    defineField({
      name: 'service',
      type: 'string',
      group: 'details',
      description: 'What you did for them, e.g. “Website Development · Headless CMS”.',
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 4,
      group: 'details',
      description:
        'A short paragraph or two that opens the Case Study, above the body. Leave a blank line between paragraphs.',
    }),
    ...sharedDetailFields(WRITING_KINDS.caseStudy).map((field) =>
      field.name === 'tags'
        ? {...field, description: 'The technologies used, e.g. Next.js, Sanity, Tailwind CSS.'}
        : field.name === 'coverImage'
          ? {...field, title: 'Hero image'}
          : field,
    ),
    ...seoFields(WRITING_KINDS.caseStudy, {titleFallback: '“<Client> Case Study”'}),
  ],
  orderings: [PUBLISHED_AT_DESC],
  preview: {
    select: {title: 'title', client: 'client', media: 'coverImage'},
    prepare: ({title, client, media}) => ({
      title: title || 'Untitled',
      subtitle: client,
      media,
    }),
  },
})
