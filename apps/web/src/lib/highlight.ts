import {cacheLife} from 'next/cache'
import {createCssVariablesTheme, createHighlighterCore, type HighlighterCore} from 'shiki/core'
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript'

// Colours come from CSS variables mapped to the calm tokens in globals.css, so code follows
// light and dark mode with everything else.
const theme = createCssVariablesTheme({name: 'calm', variablePrefix: '--shiki-', fontStyle: true})

/** The Studio's Code Block languages (`CODE_LANGUAGES` from sanity-plugin-writing-room) → Shiki ids. */
const LANGUAGES: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  python: 'python',
  shell: 'shellscript',
  text: 'text',
}

let highlighter: Promise<HighlighterCore> | undefined
const getHighlighter = () =>
  (highlighter ??= createHighlighterCore({
    themes: [theme],
    engine: createJavaScriptRegexEngine(),
    langs: [
      import('shiki/langs/javascript.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/css.mjs'),
      import('shiki/langs/python.mjs'),
      import('shiki/langs/shellscript.mjs'),
    ],
  }))

export async function highlight(code: string, language: string): Promise<string> {
  'use cache'
  cacheLife('max')
  const lang = LANGUAGES[language] ?? 'text'
  return (await getHighlighter()).codeToHtml(code, {lang, theme: 'calm'})
}
