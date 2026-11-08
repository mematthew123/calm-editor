import Link from 'next/link'
import {Suspense} from 'react'
import {describePost, formatDate} from '@/lib/text'
import {type FetchOptions, getFetchOptions, sanityFetch} from '@/sanity/live'
import {POST_INDEX_QUERY} from '@/sanity/queries'

export default function Home() {
  return (
    <main className="mx-auto max-w-[var(--calm-measure)] px-4 py-16 sm:py-24">
      <h1 className="mb-12 font-prose text-[2.25rem] leading-tight font-medium text-balance">Posts</h1>
      <Suspense fallback={<IndexPlaceholder />}>
        <PostIndex />
      </Suspense>
    </main>
  )
}

async function PostIndex() {
  const posts = await getPostIndex(await getFetchOptions())

  if (posts.length === 0) {
    return <p className="text-ink-muted">Nothing published yet.</p>
  }

  return (
    <ol className="grid gap-10">
      {posts.map((post) => {
        const description = describePost(post.excerpt, post.opening)
        const date = formatDate(post.publishedAt)
        return (
          <li key={post._id}>
            <Link href={`/posts/${post.slug}`} className="group block">
              {date && <p className="mb-1 font-ui text-sm text-ink-muted">{date}</p>}
              <h2 className="font-prose text-2xl leading-snug font-semibold text-balance group-hover:text-accent">
                {post.title || 'Untitled'}
              </h2>
              {description && <p className="mt-2 font-prose text-lg text-ink-muted text-pretty">{description}</p>}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

async function getPostIndex({perspective, stega}: FetchOptions) {
  'use cache'
  const {data} = await sanityFetch({query: POST_INDEX_QUERY, perspective, stega})
  return data
}

function IndexPlaceholder() {
  return (
    <div aria-hidden className="grid gap-10">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 rounded-[var(--calm-radius-large)] bg-surface opacity-60" />
      ))}
    </div>
  )
}
