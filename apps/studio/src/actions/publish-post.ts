import {
  type DocumentActionComponent,
  type DocumentActionsContext,
  type SanityClient,
  useDocumentOperation,
} from 'sanity'
import {slugify, uniqueSlug} from '../lib/slug'

const API_VERSION = '2026-11-01'

interface PostSnapshot {
  title?: unknown
  slug?: {current?: string}
  publishedAt?: string
}

function slugTakenByAnotherPost(client: SanityClient, postId: string) {
  return (slug: string) =>
    client.fetch<boolean>(
      `count(*[_type == "post" && slug.current == $slug && !(_id in [$id, "drafts." + $id])]) > 0`,
      {slug, id: postId},
    )
}

/**
 * Extends the built-in Publish so a Post can always be published with only its Prose filled in
 * (docs/adr/0002-only-prose-is-required-to-publish.md): a missing slug is derived from the title
 * (once, so it stays put after the first publish), and the published date is stamped if unset.
 */
export function withPostDetailsOnPublish(
  original: DocumentActionComponent,
  context: DocumentActionsContext,
): DocumentActionComponent {
  const client = context.getClient({apiVersion: API_VERSION})

  const PublishPostAction: DocumentActionComponent = (props) => {
    const result = original(props)
    const {patch} = useDocumentOperation(props.id, props.type)
    if (!result) return result

    return {
      ...result,
      onHandle: async () => {
        const post = (props.draft ?? props.published) as PostSnapshot | null
        const set: Record<string, unknown> = {}

        const base = typeof post?.title === 'string' ? slugify(post.title) : ''
        if (!post?.slug?.current && base) {
          const current = await uniqueSlug(base, slugTakenByAnotherPost(client, props.id))
          set.slug = {_type: 'slug', current}
        }
        if (!post?.publishedAt) set.publishedAt = new Date().toISOString()

        if (Object.keys(set).length > 0) patch.execute([{set}])
        result.onHandle?.()
      },
    }
  }
  PublishPostAction.action = original.action
  PublishPostAction.displayName = 'PublishPostAction'
  return PublishPostAction
}
