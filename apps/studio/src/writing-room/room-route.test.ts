import {route} from 'sanity/router'
import {describe, expect, it} from 'vitest'
import {openedDocument, ROOM_ROUTES, roomState} from './room-route'

const router = route.create(
  '/',
  ROOM_ROUTES.map((path) => route.create(path)),
)

describe('room routes', () => {
  it('keeps a Post at its original URL', () => {
    expect(router.encode(roomState('abc', 'post'))).toBe('/abc')
    expect(openedDocument(router.decode('/abc') ?? {})).toEqual({
      documentId: 'abc',
      documentType: 'post',
    })
  })

  it('puts the type in the path for a Case Study', () => {
    expect(router.encode(roomState('abc', 'caseStudy'))).toBe('/caseStudy/abc')
    expect(openedDocument(router.decode('/caseStudy/abc') ?? {})).toEqual({
      documentId: 'abc',
      documentType: 'caseStudy',
    })
  })

  it('shows the Lobby when no document is open', () => {
    expect(openedDocument(router.decode('/') ?? {})).toBeNull()
  })

  it('refuses a type the room can’t write', () => {
    expect(openedDocument({documentId: 'abc', documentType: 'sanity.imageAsset'})).toBeNull()
  })
})
