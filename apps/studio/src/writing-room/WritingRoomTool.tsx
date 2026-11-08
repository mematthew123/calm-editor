import '@calm/tokens/tokens.css'

import {Suspense} from 'react'
import {useColorSchemeValue} from 'sanity'
import {useRouter} from 'sanity/router'
import {Lobby} from './Lobby'
import {Surface} from './primitives'
import {Room} from './Room'

export function WritingRoomTool() {
  const {state} = useRouter()
  const scheme = useColorSchemeValue()
  const postId = typeof state.postId === 'string' ? state.postId : undefined

  return (
    <Surface data-scheme={scheme} data-calm-surface="">
      <Suspense fallback={null}>{postId ? <Room key={postId} postId={postId} /> : <Lobby />}</Suspense>
    </Surface>
  )
}
