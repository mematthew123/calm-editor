import {EditorProvider, useEditor} from '@portabletext/editor'
import {ArrowLeftIcon} from '@sanity/icons/ArrowLeft'
import {CloseIcon} from '@sanity/icons/Close'
import {
  discardDocument,
  type DocumentHandle,
  useApplyDocumentActions,
  useDocument,
  useDocumentProjection,
} from '@sanity/sdk-react'
import {Suspense, useCallback, useMemo, useState} from 'react'
import {useColorSchemeValue} from 'sanity'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'
import {BodyEditor} from './editor/BodyEditor'
import {useBodySchema} from './editor/schema'
import {isEmptyPost} from './empty-post'
import {useOpenDetails} from './navigation'
import {Column, Placeholder, QuietButton, RoomControls} from './primitives'
import {TitleField} from './TitleField'
import {useEscape} from './use-escape'

/** The Writing Room for one Post. */
export function Room({postId}: {postId: string}) {
  const handle = useMemo<DocumentHandle>(() => ({documentId: postId, documentType: 'post'}), [postId])
  const [problem, setProblem] = useState<string | null>(null)

  return (
    <Suspense fallback={<LoadingRoom />}>
      <LoadedRoom handle={handle} problem={problem} onProblem={setProblem} />
    </Suspense>
  )
}

function LoadingRoom() {
  const router = useRouter()
  const backToLobby = useCallback(() => router.navigate({}), [router])
  useEscape(backToLobby)
  return (
    <>
      <RoomControls
        start={
          <QuietButton icon={ArrowLeftIcon} onClick={backToLobby}>
            Leave
          </QuietButton>
        }
      />
      <Page>
        <Placeholder $height="3.5rem" />
      </Page>
    </>
  )
}

function LoadedRoom({
  handle,
  problem,
  onProblem,
}: {
  handle: DocumentHandle
  problem: string | null
  onProblem: (problem: string | null) => void
}) {
  const scheme = useColorSchemeValue()
  const schemaDefinition = useBodySchema()
  const {data} = useDocumentProjection<{_id: string}>({...handle, projection: '{_id}'})
  const isPublished = !!data?._status?.lastEditedPublishedAt

  return (
    <EditorProvider initialConfig={{schemaDefinition}}>
      <RoomControls
        start={<LeaveButton handle={handle} isPublished={isPublished} />}
        end={
          <>
            {problem && (
              <Problem role="alert">
                {problem}
                <QuietButton icon={CloseIcon} aria-label="Dismiss" onClick={() => onProblem(null)} />
              </Problem>
            )}
            <DetailsButton postId={handle.documentId} />
          </>
        }
      />
      <Page as="article">
        <Title handle={handle} isPublished={isPublished} />
        <BodyEditor handle={handle} scheme={scheme} onUploadFailed={onProblem} />
      </Page>
    </EditorProvider>
  )
}

/** Enter in the title carries the Writer into the body. */
function Title({handle, isPublished}: {handle: DocumentHandle; isPublished: boolean}) {
  const editor = useEditor()
  return (
    <TitleField
      handle={handle}
      isPublished={isPublished}
      onEnter={() => editor.send({type: 'focus'})}
    />
  )
}

/**
 * Leave (or Esc) returns to the Lobby. A Post that was never published and is still completely
 * empty is discarded on the way out, so an abandoned "Start a new Post" leaves nothing behind.
 */
function LeaveButton({handle, isPublished}: {handle: DocumentHandle; isPublished: boolean}) {
  const router = useRouter()
  const {data: post} = useDocument<{title?: unknown; body?: unknown}>(handle)
  const apply = useApplyDocumentActions()

  const leave = useCallback(() => {
    if (!isPublished && isEmptyPost(post)) void apply(discardDocument(handle))
    router.navigate({})
  }, [apply, handle, isPublished, post, router])
  useEscape(leave)

  return (
    <QuietButton icon={ArrowLeftIcon} onClick={leave}>
      Leave
    </QuietButton>
  )
}

function DetailsButton({postId}: {postId: string}) {
  const openDetails = useOpenDetails(postId)
  return <QuietButton onClick={openDetails}>Details</QuietButton>
}

const Page = styled(Column)`
  font-family: var(--calm-font-prose);
  font-size: var(--calm-prose-size-medium);
  font-weight: var(--calm-weight-prose);
  line-height: var(--calm-type-prose-leading);
`

const Problem = styled.p`
  display: flex;
  align-items: center;
  gap: var(--calm-space-xs);
  margin: 0;
  color: var(--calm-color-caution);
  font-size: var(--calm-type-ui-size-small);

  button {
    min-height: 1.75rem;
    padding: var(--calm-space-xs);
    color: inherit;
  }
`
