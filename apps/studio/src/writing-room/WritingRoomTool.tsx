import '@calm/tokens/tokens.css'

import {Suspense} from 'react'
import {useColorSchemeValue} from 'sanity'
import {useRouter} from 'sanity/router'
import {Lobby} from './Lobby'
import {Surface} from './primitives'
import {Room} from './Room'
import {openedDocument} from './room-route'

export function WritingRoomTool() {
  const {state} = useRouter()
  const scheme = useColorSchemeValue()
  const opened = openedDocument(state)

  return (
    <Surface data-scheme={scheme} data-calm-surface="">
      <Suspense fallback={null}>
        {opened ? (
          <Room key={opened.documentId} documentId={opened.documentId} documentType={opened.documentType} />
        ) : (
          <Lobby />
        )}
      </Suspense>
    </Surface>
  )
}
