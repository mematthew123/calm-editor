import {highlight} from '@/lib/highlight'

const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
  python: 'Python',
  shell: 'Shell',
}

export async function CodeBlock({code, language}: {code: string; language: string}) {
  if (!code.trim()) return null
  const html = await highlight(code, language)
  const name = LANGUAGE_NAMES[language]
  return (
    <figure className="code-block">
      {name && <figcaption>{name}</figcaption>}
      {/* Shiki escapes the code; the markup is its own. */}
      <div dangerouslySetInnerHTML={{__html: html}} />
    </figure>
  )
}
