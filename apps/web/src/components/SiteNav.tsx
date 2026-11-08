import Link from 'next/link'

/** A quiet line of links between the kinds of writing the site publishes. */
export function SiteNav() {
  return (
    <nav aria-label="Site" className="mx-auto max-w-[var(--calm-measure)] px-4 pt-8 font-ui text-sm">
      <ul className="flex gap-6 text-ink-muted">
        <li>
          <Link href="/" className="hover:text-ink">
            Posts
          </Link>
        </li>
        <li>
          <Link href="/case-studies" className="hover:text-ink">
            Case Studies
          </Link>
        </li>
      </ul>
    </nav>
  )
}
