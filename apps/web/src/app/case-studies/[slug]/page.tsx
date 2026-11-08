import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'
import {Prose} from '@/components/Prose'
import {SanityImage} from '@/components/SanityImage'
import {describePost, formatDate, paragraphs} from '@/lib/text'
import {urlFor} from '@/sanity/image'
import {
  CASE_STUDY_CACHE_TAG,
  type FetchOptions,
  getFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
} from '@/sanity/live'
import {CASE_STUDY_METADATA_QUERY, CASE_STUDY_QUERY, CASE_STUDY_SLUGS_QUERY} from '@/sanity/queries'

export async function generateStaticParams() {
  const slugs = await sanityFetchStaticParams({query: CASE_STUDY_SLUGS_QUERY, tag: CASE_STUDY_CACHE_TAG})
  // Cache Components needs at least one param; this one simply 404s.
  return slugs.length > 0
    ? slugs.flatMap(({slug}) => (slug ? [{slug}] : []))
    : [{slug: '__no-case-studies__'}]
}

export async function generateMetadata({params}: PageProps<'/case-studies/[slug]'>): Promise<Metadata> {
  const [{slug}, {perspective}] = await Promise.all([params, getFetchOptions()])
  const caseStudy = await sanityFetchMetadata({
    query: CASE_STUDY_METADATA_QUERY,
    params: {slug},
    perspective,
    tag: CASE_STUDY_CACHE_TAG,
  })
  if (!caseStudy) return {}

  const title = caseStudy.client ? `${caseStudy.client} Case Study` : (caseStudy.title ?? undefined)
  const description = describePost(caseStudy.excerpt, caseStudy.summary)
  const image = caseStudy.coverImage?.asset
    ? urlFor(caseStudy.coverImage).width(1200).height(630).fit('crop').url()
    : undefined

  return {
    title,
    description,
    alternates: {canonical: `/case-studies/${caseStudy.slug}`},
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: caseStudy.publishedAt ?? undefined,
      images: image ? [{url: image, width: 1200, height: 630, alt: caseStudy.coverImage?.alt ?? ''}] : undefined,
    },
  }
}

export default function CaseStudyPage({params}: PageProps<'/case-studies/[slug]'>) {
  // Params are awaited inside Suspense so newly published Case Studies get the page shell immediately.
  return (
    <main className="mx-auto max-w-[var(--calm-measure)] px-4 py-16 sm:py-24">
      <Suspense fallback={<CaseStudyPlaceholder />}>
        <CaseStudyRoute params={params} />
      </Suspense>
    </main>
  )
}

async function CaseStudyRoute({params}: Pick<PageProps<'/case-studies/[slug]'>, 'params'>) {
  const [{slug}, options] = await Promise.all([params, getFetchOptions()])
  const caseStudy = await getCaseStudy(slug, options)
  if (!caseStudy) notFound()

  const meta = [caseStudy.client, formatDate(caseStudy.publishedAt)].filter(Boolean).join(' · ')
  const summary = paragraphs(caseStudy.summary)

  return (
    <article>
      <header className="mb-12">
        <Link href="/case-studies" className="font-ui text-sm text-ink-muted hover:text-ink">
          ← All Case Studies
        </Link>
        {meta && <p className="mt-10 font-ui text-sm text-ink-muted">{meta}</p>}
        <h1 className="mt-2 font-prose text-[2.8125rem] leading-tight font-medium text-balance">
          {caseStudy.title || 'Untitled'}
        </h1>
        {summary.length > 0 && (
          <div className="mt-6 grid gap-4 font-prose text-xl text-ink-muted text-pretty">
            {summary.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
        {caseStudy.service && <p className="mt-6 font-ui text-sm text-ink-muted">{caseStudy.service}</p>}
        {/* No hero image? The title on paper is the header. */}
        {caseStudy.coverImage?.asset && (
          <SanityImage
            value={caseStudy.coverImage}
            priority
            className="mt-10 max-h-[70vh] w-full rounded-[var(--calm-radius)] object-cover"
          />
        )}
      </header>
      <Prose value={caseStudy.body ?? []} />
      {caseStudy.tags && caseStudy.tags.length > 0 && (
        <ul aria-label="Technologies" className="mt-16 flex flex-wrap gap-2 font-ui text-sm text-ink-muted">
          {caseStudy.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-surface px-3 py-1">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

async function getCaseStudy(slug: string, {perspective, stega}: FetchOptions) {
  'use cache'
  const {data} = await sanityFetch({
    query: CASE_STUDY_QUERY,
    params: {slug},
    perspective,
    stega,
    tags: [CASE_STUDY_CACHE_TAG],
  })
  return data
}

function CaseStudyPlaceholder() {
  return (
    <div aria-hidden className="grid gap-6">
      <div className="h-14 rounded-[var(--calm-radius-large)] bg-surface opacity-60" />
      <div className="h-64 rounded-[var(--calm-radius-large)] bg-surface opacity-60" />
    </div>
  )
}
