import type {Metadata} from 'next'
import {Figtree, Newsreader} from 'next/font/google'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'
import {DraftModeBanner} from '@/components/DraftModeBanner'
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {default: 'Calm Editor', template: '%s · Calm Editor'},
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${figtree.variable} antialiased`}>
      <body className="min-h-dvh">
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
