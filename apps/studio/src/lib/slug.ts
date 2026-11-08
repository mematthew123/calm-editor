const MAX_LENGTH = 96

/** Turns a Post title into a URL-safe slug, e.g. "Notes on Slowness" → "notes-on-slowness". */
export function slugify(title: string): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (slug.length <= MAX_LENGTH) return slug
  const cut = slug.slice(0, MAX_LENGTH + 1)
  return cut.slice(0, cut.lastIndexOf('-')).replace(/-+$/, '')
}

/** Finds the first free variant of `base`: `base`, then `base-2`, `base-3`… */
export async function uniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base
  for (let n = 2; await isTaken(candidate); n++) candidate = `${base}-${n}`
  return candidate
}
