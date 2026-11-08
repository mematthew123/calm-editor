/**
 * How long a page's title and description can be before search results cut them off, and how
 * short they can be before they waste the space. Google measures in pixels, so these are the
 * usual character stand-ins (and what Ahrefs' Site Audit checks). The Studio warns against them;
 * the Reading Site fits its fallbacks to the maximums.
 */
export const SEO_LIMITS = {
  title: {min: 30, max: 60},
  description: {min: 110, max: 160},
} as const

export type SeoField = keyof typeof SEO_LIMITS

/**
 * Advice for a title or description that's outside its range, with the count so the Writer can see
 * how far off it is, or `undefined` when it fits. An empty value fits: the site has a fallback.
 */
export function seoLengthAdvice(field: SeoField, value: string | undefined): string | undefined {
  const length = value?.replace(/\s+/g, ' ').trim().length ?? 0
  if (length === 0) return undefined
  const {min, max} = SEO_LIMITS[field]
  if (length > max) {
    return `${length} characters: search results show about ${max}, so cut ${length - max}.`
  }
  if (length < min) {
    return `${length} characters: aim for ${min}–${max} so search results have something to show.`
  }
  return undefined
}
