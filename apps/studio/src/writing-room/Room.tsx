import {ArrowLeftIcon} from '@sanity/icons/ArrowLeft'
import {useDocumentProjection} from '@sanity/sdk-react'
import {Suspense, useCallback} from 'react'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'
import {NEW_POST} from './constants'
import {useOpenDetails} from './navigation'
import {Column, Placeholder, QuietButton, RoomControls} from './primitives'
import {useEscape} from './use-escape'

/** The Writing Room for one Post. The editor itself arrives in stage 3. */
export function Room({postId}: {postId: string}) {
  const router = useRouter()
  const backToLobby = useCallback(() => router.navigate({}), [router])
  useEscape(backToLobby)
  const isNew = postId === NEW_POST

  return (
    <>
      <RoomControls
        start={
          <QuietButton icon={ArrowLeftIcon} onClick={backToLobby}>
            Leave
          </QuietButton>
        }
        end={!isNew && <DetailsButton postId={postId} />}
      />
      <Page as="article">
        {isNew ? (
          <Title $empty>Untitled</Title>
        ) : (
          <Suspense fallback={<Placeholder $height="3.5rem" />}>
            <PostTitle postId={postId} />
          </Suspense>
        )}
        <Body>Start writing…</Body>
      </Page>
    </>
  )
}

function DetailsButton({postId}: {postId: string}) {
  const openDetails = useOpenDetails(postId)
  return <QuietButton onClick={openDetails}>Details</QuietButton>
}

function PostTitle({postId}: {postId: string}) {
  const {data} = useDocumentProjection<{title?: string}>({
    documentId: postId,
    documentType: 'post',
    projection: '{title}',
  })
  const title = data?.title
  return <Title $empty={!title}>{title || 'Untitled'}</Title>
}

const Page = styled(Column)`
  font-family: var(--calm-font-prose);
  font-size: var(--calm-prose-size-medium);
  font-weight: var(--calm-weight-prose);
  line-height: var(--calm-type-prose-leading);
`

const Title = styled.h1<{$empty?: boolean}>`
  margin: 0 0 var(--calm-space-lg);
  color: ${({$empty}) => ($empty ? 'var(--calm-color-ink-muted)' : 'inherit')};
  font-size: var(--calm-type-title);
  font-weight: var(--calm-weight-title);
  line-height: var(--calm-type-heading-leading);
  text-wrap: balance;
`

const Body = styled.p`
  margin: 0;
  color: var(--calm-color-ink-muted);
`
