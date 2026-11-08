export type EmbedProvider = 'youtube' | 'vimeo' | 'spotify'

export interface ParsedEmbed {
  provider: EmbedProvider
  /** Provider-specific id; for Spotify it includes the kind, e.g. `track/4uLU6…`. */
  id: string
}

export const EMBED_PROVIDER_NAMES: Record<EmbedProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  spotify: 'Spotify',
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const SPOTIFY_KINDS = new Set(['track', 'album', 'playlist', 'episode', 'show', 'artist'])

/** Recognises a link to a supported Embed provider, or returns null. */
export function parseEmbedUrl(input: string): ParsedEmbed | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m)\./, '')
  const segments = url.pathname.split('/').filter(Boolean)

  if (host === 'youtube.com') {
    const id =
      segments[0] === 'watch'
        ? url.searchParams.get('v')
        : ['embed', 'shorts', 'live'].includes(segments[0] ?? '')
          ? segments[1]
          : null
    return id && YOUTUBE_ID.test(id) ? {provider: 'youtube', id} : null
  }
  if (host === 'youtu.be') {
    const id = segments[0]
    return id && YOUTUBE_ID.test(id) ? {provider: 'youtube', id} : null
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = segments.find((segment) => /^\d+$/.test(segment))
    return id ? {provider: 'vimeo', id} : null
  }

  if (host === 'open.spotify.com') {
    const rest = segments[0]?.startsWith('intl-') ? segments.slice(1) : segments
    const [kind, id] = rest
    return kind && id && SPOTIFY_KINDS.has(kind) ? {provider: 'spotify', id: `${kind}/${id}`} : null
  }

  return null
}
