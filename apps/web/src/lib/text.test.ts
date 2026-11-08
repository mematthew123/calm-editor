import {describe, expect, it} from 'vitest'
import {describePost, formatDate, paragraphs} from './text'

describe('describePost', () => {
  it('prefers the Writer’s excerpt', () => {
    expect(describePost('  A short excerpt. ', 'The opening')).toBe('A short excerpt.')
  })

  it('falls back to the opening of the Post when there is no excerpt', () => {
    expect(describePost(null, 'It began quietly.')).toBe('It began quietly.')
  })

  it('trims a long opening at a word boundary, with an ellipsis', () => {
    const description = describePost('', 'word, '.repeat(60))
    expect(description!.length).toBeLessThanOrEqual(161)
    expect(description!.endsWith('word…')).toBe(true)
  })

  it('is undefined when there is nothing to say', () => {
    expect(describePost(undefined, '   ')).toBeUndefined()
  })
})

describe('formatDate', () => {
  it('formats in UTC so the date never shifts with the reader’s timezone', () => {
    expect(formatDate('2026-11-07T23:30:00Z')).toBe('November 7, 2026')
  })
})

describe('paragraphs', () => {
  it('splits at blank lines and folds single line breaks into spaces', () => {
    expect(paragraphs('First line\ncontinues.\n\n  Second.  \n\n\n')).toEqual([
      'First line continues.',
      'Second.',
    ])
  })

  it('is empty when there is no text', () => {
    expect(paragraphs(undefined)).toEqual([])
    expect(paragraphs('   ')).toEqual([])
  })
})
