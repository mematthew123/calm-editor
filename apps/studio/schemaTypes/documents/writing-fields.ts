import {defineField, type SlugIsUniqueValidator} from 'sanity'
import {SEO_LIMITS, seoLengthAdvice, type WritingKind} from '@calm/content'
import {API_VERSION} from '../../src/lib/api-version'

/**
 * Until a piece's first publish its slug follows the title, and publishing settles any clash
 * (`notes` → `notes-2`), so a clash isn't an error yet. Flagging it would disable Publish before
 * that settling could run. Once published, the slug stays put and must be unique within its type.
 */
const isUniqueOncePublished: SlugIsUniqueValidator = async (slug, context) => {
  const id = context.document?._id.replace(/^(drafts|versions\.[^.]+)\./, '')
  if (!id) return context.defaultIsUnique(slug, context)
  const isPublished = await context
    .getClient({apiVersion: API_VERSION})
    .fetch<boolean>('defined(*[_id == $id][0]._id)', {id})
  return isPublished ? context.defaultIsUnique(slug, context) : true
}

export const WRITING_GROUPS = [
  {name: 'prose', title: 'Prose', default: true},
  {name: 'details', title: 'Details'},
  {name: 'seo', title: 'SEO'},
]

/** Prose: what the Writer composes in the Writing Room. Only these may block publishing. */
export function proseFields(kind: WritingKind) {
  return [
    defineField({
      name: 'title',
      type: 'string',
      group: 'prose',
      validation: (rule) => rule.required().error(`Every ${kind.singular} needs a title.`),
    }),
    defineField({
      name: 'body',
      type: 'body',
      group: 'prose',
    }),
  ]
}

/** The slug comes first among the Details, since it's settled for the Writer on publish. */
export function slugField(kind: WritingKind) {
  return defineField({
    name: 'slug',
    type: 'slug',
    group: 'details',
    description: `Follows the title until the ${kind.singular} is first published, then stays put.`,
    options: {source: 'title', maxLength: 96, isUnique: isUniqueOncePublished},
  })
}

/**
 * The Details every kind of writing shares. All optional: the Reading Site supplies a fallback,
 * and the Writing Room (which can't show Details) must never be blocked by one.
 */
export function sharedDetailFields(kind: WritingKind) {
  return [
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'details',
      description: `A sentence or two for previews and social cards. Leave empty to use the opening of the ${kind.singular}.`,
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
            rule
              .custom((alt, context) => {
                const image = context.parent as {asset?: unknown} | undefined
                if (!image?.asset || alt?.trim()) return true
                return 'A description helps people who can’t see the image.'
              })
              .warning(),
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      group: 'details',
      description: `Set automatically the first time this ${kind.singular} is published. Change it to backdate.`,
    }),
    defineField({
      name: 'tags',
      type: 'array',
      group: 'details',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      validation: (rule) => rule.unique(),
    }),
  ]
}

/**
 * SEO: how the piece reads in search results and social cards, when that should differ from its
 * title and excerpt. Optional like every Detail, and length advice is only a warning, so these
 * never block a publish from the Writing Room (which can't show them).
 */
export function seoFields(
  kind: WritingKind,
  {titleFallback = `the ${kind.singular}’s title`}: {titleFallback?: string} = {},
) {
  const {title, description} = SEO_LIMITS
  return [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: `The title in search results and social cards. Leave empty to use ${titleFallback}. Aim for ${title.min}–${title.max} characters.`,
      validation: (rule) =>
        rule.custom((value?: string) => seoLengthAdvice('title', value) ?? true).warning(),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: `The summary under the title in search results. Leave empty to use the excerpt (or the opening of the ${kind.singular}). Aim for ${description.min}–${description.max} characters.`,
      validation: (rule) =>
        rule.custom((value?: string) => seoLengthAdvice('description', value) ?? true).warning(),
    }),
  ]
}

export const PUBLISHED_AT_DESC = {
  title: 'Recently published',
  name: 'publishedAtDesc',
  by: [{field: 'publishedAt', direction: 'desc' as const}],
}
