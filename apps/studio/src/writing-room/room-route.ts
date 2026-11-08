import {isWritingType, type WritingType} from '@calm/content'

/**
 * The Writing Room's router state for one piece of writing. Posts keep their original URL,
 * `/writing-room/<id>`, so existing links still open; other kinds carry their type in the path,
 * `/writing-room/caseStudy/<id>`, since the room needs the type before it can load the document.
 */
export type RoomState = {
  documentId: string
  documentType?: WritingType
}

export const ROOM_ROUTES = ['/:documentId', '/:documentType/:documentId'] as const

export function roomState(documentId: string, documentType: WritingType): RoomState {
  return documentType === 'post' ? {documentId} : {documentId, documentType}
}

/** Reads the room's state back: the document to open, or null for the Lobby. */
export function openedDocument(
  state: Record<string, unknown>,
): {documentId: string; documentType: WritingType} | null {
  const {documentId, documentType} = state
  if (typeof documentId !== 'string' || !documentId) return null
  if (documentType === undefined) return {documentId, documentType: 'post'}
  return isWritingType(documentType) ? {documentId, documentType} : null
}
