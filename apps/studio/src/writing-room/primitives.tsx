import {type ComponentType, type ReactNode} from 'react'
import styled from 'styled-components'

/**
 * Shared building blocks for the Writing Room. Every value comes from `@calm/tokens`
 * CSS variables; see DESIGN.md before adding a literal.
 */

/** The page: warm paper that follows the Studio's colour scheme via `data-scheme`. */
export const Surface = styled.div`
  position: relative;
  height: 100%;
  overflow-y: auto;
  background: var(--calm-color-paper);
  color: var(--calm-color-ink);
  font-family: var(--calm-font-ui);
  font-size: var(--calm-type-ui-size);
  font-weight: var(--calm-weight-ui);
  -webkit-font-smoothing: antialiased;

  &::selection,
  & *::selection {
    background: var(--calm-color-selection);
  }
`

/** The single centred column, the width of the measure. */
export const Column = styled.div`
  box-sizing: content-box;
  max-width: var(--calm-measure);
  margin-inline: auto;
  padding: var(--calm-space-xxl) var(--calm-space-lg) var(--calm-space-xxl);
`

const ControlsBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--calm-space-md);
  padding: var(--calm-space-md) var(--calm-space-lg);
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--calm-space-xs);
`

/** Room Controls: quiet, in the corners, never over the Prose. */
export function RoomControls({start, end}: {start?: ReactNode; end?: ReactNode}) {
  return (
    <ControlsBar aria-label="Room controls">
      <ControlsGroup>{start}</ControlsGroup>
      <ControlsGroup>{end}</ControlsGroup>
    </ControlsBar>
  )
}

const QuietButtonRoot = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--calm-space-xs);
  min-height: 2.25rem;
  padding: var(--calm-space-sm) 0.75rem;
  border: 0;
  border-radius: var(--calm-radius-pill);
  background: transparent;
  color: var(--calm-color-ink-muted);
  font: inherit;
  cursor: pointer;
  transition:
    background-color var(--calm-motion-gentle) var(--calm-motion-easing),
    color var(--calm-motion-gentle) var(--calm-motion-easing);

  &:hover,
  &:focus-visible {
    background: var(--calm-color-surface);
    color: var(--calm-color-ink);
  }

  &:focus-visible {
    outline: 2px solid var(--calm-color-accent);
    outline-offset: 2px;
  }

  svg {
    flex-shrink: 0;
    font-size: 1.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

/** The default for every Room Control that isn't Publish. */
export function QuietButton({
  icon: Icon,
  children,
  ...props
}: {icon?: ComponentType; children?: ReactNode} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <QuietButtonRoot type="button" {...props}>
      {Icon && <Icon aria-hidden />}
      {children}
    </QuietButtonRoot>
  )
}

/** Small Figtree label for sections of the Lobby. */
export const SectionLabel = styled.h2`
  margin: 0 0 var(--calm-space-sm);
  color: var(--calm-color-ink-muted);
  font-family: var(--calm-font-ui);
  font-size: var(--calm-type-ui-size-small);
  font-weight: var(--calm-weight-ui-strong);
`

/** A soft placeholder block that holds space while data loads, so nothing jumps. */
export const Placeholder = styled.div<{$height: string}>`
  height: ${({$height}) => $height};
  border-radius: var(--calm-radius-large);
  background: var(--calm-color-surface);
  opacity: 0.6;
`
