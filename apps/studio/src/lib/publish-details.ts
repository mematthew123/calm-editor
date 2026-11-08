import {slugify, uniqueSlug} from './slug'

export interface PublishablePost {
  title?: unknown
  slug?: {current?: string}
  publishedAt?: string
}

export interface PublishDetails {
  slug?: {_type: 'slug'; current: string}
  publishedAt?: string
}

/**
 * The Details a Post needs filled in as it's published, so publishing only ever requires Prose
 * (docs/adr/0002-only-prose-is-required-to-publish.md). On the first publish the slug is settled
 * (derived from the title if missing, made unique on a clash) and then stays put; the published
 * date is stamped if empty.
 */
export async function detailsForPublish({
  post,
  isFirstPublish,
  isTaken,
  now = new Date().toISOString(),
}: {
  post: PublishablePost
  isFirstPublish: boolean
  isTaken: (slug: string) => Promise<boolean>
  now?: string
}): Promise<PublishDetails> {
  const details: PublishDetails = {}
  const current = post.slug?.current

  if (!current || isFirstPublish) {
    const base = current || (typeof post.title === 'string' ? slugify(post.title) : '')
    if (base) {
      const settled = await uniqueSlug(base, isTaken)
      if (settled !== current) details.slug = {_type: 'slug', current: settled}
    }
  }
  if (!post.publishedAt) details.publishedAt = now
  return details
}
