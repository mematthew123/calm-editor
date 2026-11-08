import {type QueryParams} from 'next-sanity'
import {defineLive, type LivePerspective} from 'next-sanity/live'
import {draftMode} from 'next/headers'
import {client} from './client'

// A Viewer token: used only to read drafts while previewing. Absent in CI, which is fine.
const token = process.env.SANITY_API_READ_TOKEN

/**
 * Live, cached content. With Cache Components, every `sanityFetch` must run inside a
 * `'use cache'` function; request-time values (draft mode, params) are read outside it and
 * passed in as arguments.
 */
export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: token || false,
  browserToken: token || false,
  strict: true,
})

/**
 * Every query carries the tag for the kind it reads, so a publish can be applied without a visitor
 * online: the Sanity webhook calls /api/revalidate, which expires it. (`<SanityLive>` only
 * revalidates from a browser that's connected when the change happens, and doesn't catch up.)
 */
export const POST_CACHE_TAG = 'post'
export const CASE_STUDY_CACHE_TAG = 'caseStudy'

/** The cache tag for each document type the Reading Site shows. */
export const CACHE_TAGS: Record<string, string> = {
  post: POST_CACHE_TAG,
  caseStudy: CASE_STUDY_CACHE_TAG,
}

export type FetchOptions = {perspective: LivePerspective; stega: false}

/** Read outside `'use cache'`: drafts while previewing, published content otherwise. */
export async function getFetchOptions(): Promise<FetchOptions> {
  const {isEnabled} = await draftMode()
  return {perspective: isEnabled ? 'drafts' : 'published', stega: false}
}

export async function sanityFetchStaticParams<const Q extends string>({
  query,
  params = {},
  tag = POST_CACHE_TAG,
}: {
  query: Q
  params?: QueryParams
  tag?: string
}) {
  'use cache'
  const {data} = await sanityFetch({
    query,
    params,
    perspective: 'published',
    stega: false,
    tags: [tag],
  })
  return data
}

export async function sanityFetchMetadata<const Q extends string>({
  query,
  params = {},
  perspective,
  tag = POST_CACHE_TAG,
}: {
  query: Q
  params?: QueryParams
  perspective: LivePerspective
  tag?: string
}) {
  'use cache'
  const {data} = await sanityFetch({query, params, perspective, stega: false, tags: [tag]})
  return data
}
