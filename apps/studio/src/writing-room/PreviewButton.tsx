import {createPreviewSecret} from '@sanity/preview-url-secret/create-secret'
import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewSecret,
} from '@sanity/preview-url-secret/constants'
import {useState} from 'react'
import {useClient, useCurrentUser} from 'sanity'
import {API_VERSION} from '../lib/api-version'
import {QuietButton} from './primitives'

const READING_SITE_URL = process.env.SANITY_STUDIO_READING_SITE_URL || 'http://localhost:3000'

/**
 * Opens the Post on the Reading Site exactly as readers will see it, unpublished changes
 * included. A one-hour preview secret lets the site switch itself into draft mode.
 */
export function PreviewButton({slug, onProblem}: {slug: string | undefined; onProblem: (problem: string) => void}) {
  const client = useClient({apiVersion: API_VERSION})
  const user = useCurrentUser()
  const [opening, setOpening] = useState(false)

  if (!slug) return null

  async function preview() {
    // Open the tab now, while the click still counts, so popup blockers allow it.
    const tab = window.open('about:blank', '_blank')
    if (tab) tab.opener = null
    setOpening(true)
    try {
      const {secret} = await createPreviewSecret(client, 'calm-editor/writing-room', window.location.origin, user?.id)
      const url = new URL('/api/draft-mode/enable', READING_SITE_URL)
      url.searchParams.set(urlSearchParamPreviewSecret, secret)
      url.searchParams.set(urlSearchParamPreviewPathname, `/posts/${slug}`)
      if (tab) tab.location.href = url.toString()
      else window.open(url, '_blank', 'noopener')
    } catch {
      tab?.close()
      onProblem('The preview couldn’t be opened just now. Try again in a moment.')
    } finally {
      setOpening(false)
    }
  }

  return (
    <QuietButton onClick={() => void preview()} disabled={opening} title="Preview on the Reading Site">
      Preview
    </QuietButton>
  )
}
