import type {Metadata} from 'next'
import Link from 'next/link'
import {Suspense} from 'react'
import {describePost, formatDate} from '@/lib/text'
import {CASE_STUDY_CACHE_TAG, type FetchOptions, getFetchOptions, sanityFetch} from '@/sanity/live'
import {CASE_STUDY_INDEX_QUERY} from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'Case Studies',
  alternates: {canonical: '/case-studies'},
}

export default function CaseStudiesPage() {
  return (
    <main className="mx-auto max-w-[var(--calm-measure)] px-4 py-16 sm:py-24">
      <h1 className="mb-12 font-prose text-[2.25rem] leading-tight font-medium text-balance">Case Studies</h1>
      <Suspense fallback={<IndexPlaceholder />}>
        <CaseStudyIndex />
      </Suspense>
    </main>
  )
}

async function CaseStudyIndex() {
  const caseStudies = await getCaseStudyIndex(await getFetchOptions())

  if (caseStudies.length === 0) {
    return <p className="text-ink-muted">Nothing published yet.</p>
  }

  return (
    <ol className="grid gap-10">
      {caseStudies.map((caseStudy) => {
        const description = describePost(caseStudy.excerpt, caseStudy.summary)
        const meta = [caseStudy.client, formatDate(caseStudy.publishedAt)].filter(Boolean).join(' · ')
        return (
          <li key={caseStudy._id}>
            <Link href={`/case-studies/${caseStudy.slug}`} className="group block">
              {meta && <p className="mb-1 font-ui text-sm text-ink-muted">{meta}</p>}
              <h2 className="font-prose text-2xl leading-snug font-semibold text-balance group-hover:text-accent">
                {caseStudy.title || 'Untitled'}
              </h2>
              {description && <p className="mt-2 font-prose text-lg text-ink-muted text-pretty">{description}</p>}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

async function getCaseStudyIndex({perspective, stega}: FetchOptions) {
  'use cache'
  const {data} = await sanityFetch({
    query: CASE_STUDY_INDEX_QUERY,
    perspective,
    stega,
    tags: [CASE_STUDY_CACHE_TAG],
  })
  return data
}

function IndexPlaceholder() {
  return (
    <div aria-hidden className="grid gap-10">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 rounded-[var(--calm-radius-large)] bg-surface opacity-60" />
      ))}
    </div>
  )
}
