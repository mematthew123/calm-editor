import {draftMode} from 'next/headers'
import {type NextRequest, NextResponse} from 'next/server'

export async function POST(request: NextRequest) {
  ;(await draftMode()).disable()
  return NextResponse.redirect(new URL('/', request.url), 303)
}
