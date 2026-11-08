import Image from 'next/image'
import {urlFor} from '@/sanity/image'

export interface SanityImageValue {
  alt?: string | null
  hotspot?: {x?: number; y?: number} | null
  crop?: unknown
  asset?: {
    _id: string
    url?: string | null
    metadata?: {lqip?: string | null; dimensions?: {width?: number | null; height?: number | null} | null} | null
  } | null
}

export function SanityImage({
  value,
  sizes = '(min-width: 42rem) 38rem, 100vw',
  priority = false,
  className,
}: {
  value: SanityImageValue
  sizes?: string
  priority?: boolean
  className?: string
}) {
  const dimensions = value.asset?.metadata?.dimensions
  if (!value.asset || !dimensions?.width || !dimensions.height) return null
  const {x = 0.5, y = 0.5} = value.hotspot ?? {}

  return (
    <Image
      src={urlFor(value as Parameters<typeof urlFor>[0]).url()}
      alt={value.alt ?? ''}
      width={dimensions.width}
      height={dimensions.height}
      sizes={sizes}
      priority={priority}
      placeholder={value.asset.metadata?.lqip ? 'blur' : 'empty'}
      blurDataURL={value.asset.metadata?.lqip ?? undefined}
      className={className}
      style={{objectPosition: `${x * 100}% ${y * 100}%`}}
    />
  )
}
