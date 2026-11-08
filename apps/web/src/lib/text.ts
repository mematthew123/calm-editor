const DESCRIPTION_LENGTH = 160

/** The Post's own excerpt, or (when the Writer left it empty) the opening of the Post. */
export function describePost(excerpt: string | null | undefined, opening: string | null | undefined) {
  if (excerpt?.trim()) return excerpt.trim()
  const text = (opening ?? '').replace(/\s+/g, ' ').trim()
  if (text.length <= DESCRIPTION_LENGTH) return text || undefined
  const cut = text.slice(0, DESCRIPTION_LENGTH)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:!?]$/, '')}…`
}

const dateFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long', timeZone: 'UTC'})

export function formatDate(date: string | null | undefined) {
  return date ? dateFormat.format(new Date(date)) : undefined
}

/** Splits plain text the Writer typed (a Case Study's summary) into paragraphs at blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}
