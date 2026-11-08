'use client'

/** Lets `next/image` ask Sanity's CDN for each responsive width, keeping any crop in the url. */
export default function sanityImageLoader({src, width, quality}: {src: string; width: number; quality?: number}) {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('fit', 'max')
  url.searchParams.set('auto', 'format')
  return url.toString()
}
