/**
 * The kinds of writing a Writer can do in the Writing Room. Both apps read this so the Studio's
 * Preview opens the same path the Reading Site serves, and the room names things the same way
 * the site does.
 */
export const WRITING_KINDS = {
  post: {type: 'post', singular: 'Post', plural: 'Posts', path: '/posts'},
  caseStudy: {
    type: 'caseStudy',
    singular: 'Case Study',
    plural: 'Case Studies',
    path: '/case-studies',
  },
} as const

export type WritingType = keyof typeof WRITING_KINDS
export type WritingKind = (typeof WRITING_KINDS)[WritingType]

/** Every writable document type, Posts first. */
export const WRITING_TYPES = Object.keys(WRITING_KINDS) as WritingType[]

export function isWritingType(value: unknown): value is WritingType {
  return typeof value === 'string' && Object.hasOwn(WRITING_KINDS, value)
}

/** The kind for a document type, falling back to Post for anything unrecognised. */
export function writingKind(type: unknown): WritingKind {
  return isWritingType(type) ? WRITING_KINDS[type] : WRITING_KINDS.post
}

/** Where a published piece is read on the Reading Site, e.g. `/case-studies/chipter`. */
export function readingPath(type: WritingType, slug: string): string {
  return `${WRITING_KINDS[type].path}/${slug}`
}
