import {describe, expect, it} from 'vitest'
import {SEO_LIMITS, seoLengthAdvice} from './seo'

describe('seoLengthAdvice', () => {
  it('accepts an empty value, since the site falls back', () => {
    expect(seoLengthAdvice('title', undefined)).toBeUndefined()
    expect(seoLengthAdvice('description', '   ')).toBeUndefined()
  })

  it('accepts lengths inside the range, at both ends', () => {
    expect(seoLengthAdvice('title', 'a'.repeat(SEO_LIMITS.title.min))).toBeUndefined()
    expect(seoLengthAdvice('title', 'a'.repeat(SEO_LIMITS.title.max))).toBeUndefined()
    expect(seoLengthAdvice('description', 'a'.repeat(SEO_LIMITS.description.max))).toBeUndefined()
  })

  it('says how much to cut from one that is too long', () => {
    expect(seoLengthAdvice('title', 'a'.repeat(72))).toBe(
      '72 characters: search results show about 60, so cut 12.',
    )
  })

  it('flags one that is too short', () => {
    expect(seoLengthAdvice('description', 'Too short.')).toBe(
      '10 characters: aim for 110–160 so search results have something to show.',
    )
  })

  it('counts runs of whitespace as one space, as a search result shows them', () => {
    expect(seoLengthAdvice('title', `${'a'.repeat(30)}\n\n   ${'b'.repeat(29)}`)).toBeUndefined()
  })
})
