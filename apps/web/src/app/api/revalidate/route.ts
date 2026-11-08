import {parseBody} from 'next-sanity/webhook'
import {revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {CACHE_TAGS} from '@/sanity/live'

/**
 * Called by a Sanity webhook whenever a Post or Case Study is published, changed or unpublished, so the
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
  const tag = body?._type ? CACHE_TAGS[body._type] : undefined
  if (!tag) {
    return NextResponse.json({revalidated: false, reason: 'Not a Post or Case Study'})
  }

  // Expire now: the next reader gets the fresh page rather than one more stale view.
  revalidateTag(tag, {expire: 0})
  return NextResponse.json({revalidated: true, tag})
}
