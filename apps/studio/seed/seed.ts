import {getCliClient} from 'sanity/cli'
import {API_VERSION} from '../src/lib/api-version'

/**
 * Adds a few sample Posts so the Lobby and the Reading Site aren't empty on a fresh project.
 * Run with `pnpm --filter studio seed`. Safe to re-run: Posts that already exist are left alone.
 */

let nextKey = 0
const key = () => `seed${(nextKey++).toString(36)}`

type Span = string | {text: string; marks: string[]}

function block(style: string, spans: Span[], extra: Record<string, unknown> = {}) {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    ...extra,
    children: spans.map((span) => ({
      _type: 'span',
      _key: key(),
      ...(typeof span === 'string' ? {text: span, marks: []} : span),
    })),
  }
}

const p = (...spans: Span[]) => block('normal', spans)
const h2 = (text: string) => block('h2', [text])
const quote = (text: string) => block('blockquote', [text])
const bullet = (...spans: Span[]) => block('normal', spans, {listItem: 'bullet', level: 1})
const em = (text: string) => ({text, marks: ['em']})
const strong = (text: string) => ({text, marks: ['strong']})
const sectionBreak = () => ({_type: 'sectionBreak', _key: key(), kind: 'break'})
const code = (language: string, source: string) => ({
  _type: 'codeBlock',
  _key: key(),
  language,
  code: source,
})

interface SamplePost {
  _id: string
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  tags: string[]
  body: Array<Record<string, unknown>>
}

const posts: SamplePost[] = [
  {
    _id: 'sample-welcome',
    title: 'Welcome to the Writing Room',
    slug: 'welcome-to-the-writing-room',
    publishedAt: '2026-11-07T09:00:00.000Z',
    excerpt: 'A quiet, full-screen place to write, right inside your Sanity Studio.',
    tags: ['writing room'],
    body: [
      p(
        'This Post was written in the Writing Room: a quiet, full-screen place to write inside your Sanity Studio. Open ',
        strong('Writing Room'),
        ' from the Studio’s navigation, pick this Post from the Lobby, and start typing.',
      ),
      h2('While you write'),
      p(
        'The controls step aside after a few keystrokes and come back when you pause or move the pointer.',
      ),
      bullet('Select some text to bring up formatting: bold, italic, headings, quotes and links.'),
      bullet(
        'On an empty line, type ',
        strong('+'),
        ' or ',
        strong('/'),
        ' to add an image, an embed, a code block or a section break.',
      ),
      bullet(
        'Markdown works as you type: ',
        strong('##'),
        ' for a heading, ',
        strong('>'),
        ' for a quote, ',
        strong('-'),
        ' for a list, ',
        strong('---'),
        ' for a section break.',
      ),
      bullet(
        'Room settings let you change the text size, keep the line you’re writing centred, and dim everything but the paragraph you’re in.',
      ),
      h2('Your words are safe'),
      p(
        'Every change is saved as you go. If the connection drops, the room tells you, keeps your words, and saves them when you’re back.',
      ),
      sectionBreak(),
      p(
        'When you’re ready, press ',
        strong('Publish'),
        '. If something is missing, the room takes you straight to it. Everything else about a Post (its slug, excerpt, cover image and tags) lives in its ',
        em('Details'),
        ', one click away.',
      ),
    ],
  },
  {
    _id: 'sample-on-starting',
    title: 'On starting before you’re ready',
    slug: 'on-starting-before-youre-ready',
    publishedAt: '2026-11-05T09:00:00.000Z',
    tags: ['craft'],
    body: [
      p(
        'Most pieces don’t begin with a plan. They begin with a sentence that won’t leave you alone.',
      ),
      p(
        'Write that sentence down. Then write the one after it, even if it’s wrong. A draft is only a way of finding out what you think, and you can’t find out by waiting.',
      ),
      quote('Get it down first. You can make it good later.'),
      p(
        'Leave the title rough. Leave the slug alone. Nothing here has to be decided until you publish.',
      ),
      sectionBreak(),
      p(
        'Tomorrow, read it back once, slowly. Cut the paragraph you were proudest of if it isn’t pulling its weight. Then keep going.',
      ),
    ],
  },
  {
    _id: 'sample-showing-code',
    title: 'Showing a little code',
    slug: 'showing-a-little-code',
    publishedAt: '2026-11-03T09:00:00.000Z',
    tags: ['code'],
    body: [
      p(
        'Code blocks sit in the flow of a Post like any other paragraph. Type three backticks on an empty line, or choose ',
        em('Code block'),
        ' from the insert menu, and pick a language.',
      ),
      code(
        'typescript',
        `export function readingTime(words: number, wordsPerMinute = 230) {
  return Math.max(1, Math.round(words / wordsPerMinute))
}`,
      ),
      p(
        'On the Reading Site the same block is highlighted, in colours that match the rest of the page.',
      ),
    ],
  },
]

async function seed() {
  const transaction = getCliClient({apiVersion: API_VERSION}).transaction()
  for (const {slug, ...post} of posts) {
    transaction.createIfNotExists({_type: 'post', ...post, slug: {_type: 'slug', current: slug}})
  }
  await transaction.commit()
  console.log(
    `Added ${posts.length} sample Posts (any that already existed were left as they were).`,
  )
}

seed().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
