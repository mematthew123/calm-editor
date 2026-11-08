import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'
import {Prose} from '@/components/Prose'
import {SanityImage} from '@/components/SanityImage'
import {describePost, formatDate} from '@/lib/text'
import {urlFor} from '@/sanity/image'
import {
  type FetchOptions,
  getFetchOptions,
  POST_CACHE_TAG,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
} from '@/sanity/live'
import {POST_METADATA_QUERY, POST_QUERY, POST_SLUGS_QUERY} from '@/sanity/queries'

export async function generateStaticParams() {
  const slugs = await sanityFetchStaticParams({query: POST_SLUGS_QUERY})
  // Cache Components needs at least one param; this one simply 404s.
  return slugs.length > 0 ? slugs.flatMap(({slug}) => (slug ? [{slug}] : [])) : [{slug: '__no-posts__'}]
}

export async function generateMetadata({params}: PageProps<'/posts/[slug]'>): Promise<Metadata> {
  const [{slug}, {perspective}] = await Promise.all([params, getFetchOptions()])
  const post = await sanityFetchMetadata({query: POST_METADATA_QUERY, params: {slug}, perspective})
  if (!post) return {}

  const description = describePost(post.excerpt, post.opening)
  const image = post.coverImage?.asset
    ? urlFor(post.coverImage).width(1200).height(630).fit('crop').url()
    : undefined

  return {
    title: post.title ?? undefined,
    description,
    alternates: {canonical: `/posts/${post.slug}`},
    openGraph: {
      type: 'article',
      title: post.title ?? undefined,
      description,
      publishedTime: post.publishedAt ?? undefined,
      images: image ? [{url: image, width: 1200, height: 630, alt: post.coverImage?.alt ?? ''}] : undefined,
    },
  }
}

export default function PostPage({params}: PageProps<'/posts/[slug]'>) {
  // Params are awaited inside Suspense so newly published Posts get the page shell immediately.
  return (
    <main className="mx-auto max-w-[var(--calm-measure)] px-4 py-16 sm:py-24">
      <Suspense fallback={<PostPlaceholder />}>
        <PostRoute params={params} />
      </Suspense>
    </main>
  )
}

async function PostRoute({params}: Pick<PageProps<'/posts/[slug]'>, 'params'>) {
  const [{slug}, options] = await Promise.all([params, getFetchOptions()])
  const post = await getPost(slug, options)
  if (!post) notFound()

  const date = formatDate(post.publishedAt)

  return (
    <article>
      <header className="mb-12">
        <Link href="/" className="font-ui text-sm text-ink-muted hover:text-ink">
          ← All Posts
        </Link>
        {date && <p className="mt-10 font-ui text-sm text-ink-muted">{date}</p>}
        <h1 className="mt-2 font-prose text-[2.8125rem] leading-tight font-medium text-balance">
          {post.title || 'Untitled'}
        </h1>
        {/* No cover image? The title on paper is the header. */}
        {post.coverImage?.asset && (
          <SanityImage
            value={post.coverImage}
            priority
            className="mt-10 max-h-[70vh] w-full rounded-[var(--calm-radius)] object-cover"
          />
        )}
      </header>
      <Prose value={post.body ?? []} />
      {post.tags && post.tags.length > 0 && (
        <ul className="mt-16 flex flex-wrap gap-2 font-ui text-sm text-ink-muted">
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-surface px-3 py-1">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

async function getPost(slug: string, {perspective, stega}: FetchOptions) {
  'use cache'
  const {data} = await sanityFetch({
    query: POST_QUERY,
    params: {slug},
    perspective,
    stega,
    tags: [POST_CACHE_TAG],
  })
  return data
}

function PostPlaceholder() {
  return (
    <div aria-hidden className="grid gap-6">
      <div className="h-14 rounded-[var(--calm-radius-large)] bg-surface opacity-60" />
      <div className="h-64 rounded-[var(--calm-radius-large)] bg-surface opacity-60" />
    </div>
  )
}
