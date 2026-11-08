import {describe, expect, it} from 'vitest'
import {isEmptyPost} from './empty-post'

const block = (text: string) => ({_type: 'block', _key: 'b', children: [{_type: 'span', _key: 's', text}]})

describe('isEmptyPost', () => {
  it('is empty with no title and no body', () => {
    expect(isEmptyPost({})).toBe(true)
  })

  it('is empty when the body is only blank lines and the title is whitespace', () => {
    expect(isEmptyPost({title: '  ', body: [block(''), block('')]})).toBe(true)
  })

  it('is not empty once there is a title', () => {
    expect(isEmptyPost({title: 'Notes'})).toBe(false)
  })

  it('is not empty once the body has any words', () => {
    expect(isEmptyPost({body: [block(''), block('A')]})).toBe(false)
  })

  it('is not empty when the body holds an image, Embed or other object', () => {
    expect(isEmptyPost({body: [{_type: 'sectionBreak', _key: 'x'}]})).toBe(false)
  })

  it('treats a missing document as empty', () => {
    expect(isEmptyPost(null)).toBe(true)
  })
})
