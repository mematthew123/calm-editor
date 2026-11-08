import Link from 'next/link'

export default function PostNotFound() {
  return (
    <main className="mx-auto max-w-[var(--calm-measure)] px-4 py-24">
      <h1 className="font-prose text-3xl font-medium">This Post isn’t here</h1>
      <p className="mt-4 font-prose text-lg text-ink-muted">
        It may have moved, or it hasn’t been published yet.
      </p>
      <Link href="/" className="mt-8 inline-block font-ui text-sm text-accent">
        ← All Posts
      </Link>
    </main>
  )
}
