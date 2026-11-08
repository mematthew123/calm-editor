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
 * Every Post query also carries this tag, so a publish can be applied without a visitor online:
 * the Sanity webhook calls /api/revalidate, which expires it. (`<SanityLive>` only revalidates
 * from a browser that's connected when the change happens, and doesn't catch up afterwards.)
 */
export const POST_CACHE_TAG = 'post'

export type FetchOptions = {perspective: LivePerspective; stega: false}

/** Read outside `'use cache'`: drafts while previewing, published content otherwise. */
export async function getFetchOptions(): Promise<FetchOptions> {
  const {isEnabled} = await draftMode()
  return {perspective: isEnabled ? 'drafts' : 'published', stega: false}
}

export async function sanityFetchStaticParams<const Q extends string>({
  query,
  params = {},
}: {
  query: Q
  params?: QueryParams
}) {
  'use cache'
  const {data} = await sanityFetch({
    query,
    params,
    perspective: 'published',
    stega: false,
    tags: [POST_CACHE_TAG],
  })
  return data
}

export async function sanityFetchMetadata<const Q extends string>({
  query,
  params = {},
  perspective,
}: {
  query: Q
  params?: QueryParams
  perspective: LivePerspective
}) {
  'use cache'
  const {data} = await sanityFetch({query, params, perspective, stega: false, tags: [POST_CACHE_TAG]})
  return data
}
