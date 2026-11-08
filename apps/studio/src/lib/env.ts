/**
 * The Sanity project and dataset the Studio edits, from `.env.local` (copy `.env.example`).
 * Each variable is read by name so Vite can inline it into the Studio bundle.
 */
export const projectId = required(process.env.SANITY_STUDIO_PROJECT_ID, 'SANITY_STUDIO_PROJECT_ID')
export const dataset = required(process.env.SANITY_STUDIO_DATASET, 'SANITY_STUDIO_DATASET')

function required(value: string | undefined, name: string): string {
  if (!value)
    throw new Error(`Missing ${name}. Copy apps/studio/.env.example to .env.local and fill it in.`)
  return value
}
