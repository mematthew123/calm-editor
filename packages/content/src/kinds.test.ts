import {describe, expect, it} from 'vitest'
import {isWritingType, readingPath, WRITING_TYPES, writingKind} from './kinds'

describe('writing kinds', () => {
  it('lists Posts first, then Case Studies', () => {
    expect(WRITING_TYPES).toEqual(['post', 'caseStudy'])
  })

  it.each([
    ['post', true],
    ['caseStudy', true],
    ['sanity.imageAsset', false],
    ['toString', false],
    [undefined, false],
  ])('recognises writable types: %s', (value, expected) => {
    expect(isWritingType(value)).toBe(expected)
  })

  it('falls back to Post for an unknown type', () => {
    expect(writingKind('caseStudy').singular).toBe('Case Study')
    expect(writingKind('nope').singular).toBe('Post')
  })

  it('builds the Reading Site path for each kind', () => {
    expect(readingPath('post', 'notes')).toBe('/posts/notes')
    expect(readingPath('caseStudy', 'chipter')).toBe('/case-studies/chipter')
  })
})
