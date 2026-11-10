/** Each variable is read by name so Next can inline it into client bundles. */
export const projectId = required(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'NEXT_PUBLIC_SANITY_PROJECT_ID')
export const dataset = required(process.env.NEXT_PUBLIC_SANITY_DATASET, 'NEXT_PUBLIC_SANITY_DATASET')
/** Kept in step with apps/studio/src/lib/api-version.ts and the Writing Room plugin's own. */
export const apiVersion = '2026-11-01'

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing ${name}. Copy apps/web/.env.example to .env.local and fill it in.`)
  return value
}
