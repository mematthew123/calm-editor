import {PortableText, type PortableTextComponents} from 'next-sanity'
import {type POST_QUERY_RESULT} from '@/sanity/types'
import {CodeBlock} from './CodeBlock'
import {Embed} from './Embed'
import {SanityImage, type SanityImageValue} from './SanityImage'

export type Body = NonNullable<NonNullable<POST_QUERY_RESULT>['body']>

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p>{children}</p>,
    h2: ({children}) => <h2>{children}</h2>,
    h3: ({children}) => <h3>{children}</h3>,
    blockquote: ({children}) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({children}) => <ul>{children}</ul>,
    number: ({children}) => <ol>{children}</ol>,
  },
  marks: {
    link: ({value, children}) => {
      const href: string | undefined = value?.href
      const external = !!href && /^https?:/i.test(href)
      return (
        <a href={href} rel={external ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({value}: {value: SanityImageValue & {caption?: string | null}}) => (
      <figure className="figure">
        <SanityImage value={value} />
        {value.caption && <figcaption>{value.caption}</figcaption>}
      </figure>
    ),
    embed: ({value}: {value: {url?: string | null; caption?: string | null}}) => (
      <Embed url={value.url} caption={value.caption} />
    ),
    codeBlock: ({value}: {value: {code?: string | null; language?: string | null}}) => (
      <CodeBlock code={value.code ?? ''} language={value.language ?? 'text'} />
    ),
    sectionBreak: () => <hr className="section-break" />,
  },
}

/** A Post's body, rendered on the server with the same typography as the Writing Room. */
export function Prose({value}: {value: Body}) {
  return (
    <div className="prose">
      <PortableText value={value} components={components} />
    </div>
  )
}
