import type {Metadata} from 'next'
import {Figtree, Newsreader} from 'next/font/google'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'
import {DraftModeBanner} from '@/components/DraftModeBanner'
import {SiteNav} from '@/components/SiteNav'
import {SanityLive} from '@/sanity/live'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  axes: ['opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const figtree = Figtree({subsets: ['latin'], variable: '--font-figtree', display: 'swap'})

// A custom domain wins; otherwise Vercel's production URL; otherwise local development.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default: 'Calm Editor', template: '%s · Calm Editor'},
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${figtree.variable} antialiased`}>
      <body className="min-h-dvh">
        <SiteNav />
        {children}
        <Suspense fallback={null}>
          <LiveLayer />
        </Suspense>
      </body>
    </html>
  )
}

/** Keeps content live, and shows drafts (with a way out) while previewing from the Writing Room. */
async function LiveLayer() {
  const {isEnabled} = await draftMode()
  return (
    <>
      <SanityLive includeDrafts={isEnabled} />
      {isEnabled && <DraftModeBanner />}
    </>
  )
}
