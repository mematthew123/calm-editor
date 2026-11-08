import {EMBED_PROVIDER_NAMES, embedPlayerUrl, parseEmbedUrl} from '@calm/content'

export function Embed({url, caption}: {url?: string | null; caption?: string | null}) {
  const embed = url ? parseEmbedUrl(url) : null
  if (!url) return null
  if (!embed) {
    return (
      <p>
        <a href={url}>{caption || url}</a>
      </p>
    )
  }
  const name = EMBED_PROVIDER_NAMES[embed.provider]
  return (
    <figure className="embed" data-provider={embed.provider}>
      <iframe
        src={embedPlayerUrl(embed)}
        title={caption ? `${name}: ${caption}` : name}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
