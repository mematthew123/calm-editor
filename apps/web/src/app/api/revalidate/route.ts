import {parseBody} from 'next-sanity/webhook'
import {revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {POST_CACHE_TAG} from '@/sanity/live'

/**
 * Called by a Sanity webhook whenever a Post is published, changed or unpublished, so the
 * Reading Site updates even when nobody has it open. The signature proves the call is Sanity's.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({message: 'SANITY_REVALIDATE_SECRET is not set'}, {status: 500})
  }

  // Waits for the Content Lake to be consistent, so the next render sees the published change.
  const {isValidSignature, body} = await parseBody<{_type?: string}>(request, secret)
  if (!isValidSignature) {
    return NextResponse.json({message: 'Invalid signature'}, {status: 401})
  }
  if (body?._type !== 'post') {
    return NextResponse.json({revalidated: false, reason: 'Not a Post'})
  }

  // Expire now: the next reader gets the fresh page rather than one more stale view.
  revalidateTag(POST_CACHE_TAG, {expire: 0})
  return NextResponse.json({revalidated: true, tag: POST_CACHE_TAG})
}
