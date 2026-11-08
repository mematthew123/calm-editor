import {type ReactNode, useLayoutEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import styled from 'styled-components'

const GAP = 8
const EDGE = 12

/**
 * Positions floating UI (the Selection Bubble, the Insert Menu) against a viewport rect:
 * above it when there's room, otherwise below, and always inside the window.
 */
export function Floating({
  anchor,
  placement = 'above',
  align = 'center',
  scheme,
  children,
  ...props
}: {
  anchor: DOMRect
  placement?: 'above' | 'below'
  align?: 'center' | 'start'
  scheme: string
  children: ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{top: number; left: number} | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const {width, height} = el.getBoundingClientRect()
    const fitsAbove = anchor.top - height - GAP >= EDGE
    const top =
      placement === 'above' && fitsAbove ? anchor.top - height - GAP : anchor.bottom + GAP
    const ideal = align === 'center' ? anchor.left + anchor.width / 2 - width / 2 : anchor.left
    const left = Math.min(Math.max(EDGE, ideal), window.innerWidth - width - EDGE)
    setPosition({top, left})
  }, [anchor, placement, align])

  return createPortal(
    <Root
      ref={ref}
      data-scheme={scheme}
      style={position ? {top: position.top, left: position.left} : {visibility: 'hidden'}}
      {...props}
    >
      {children}
    </Root>,
    document.body,
  )
}

const Root = styled.div`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  box-sizing: border-box;
  color: var(--calm-color-ink);
  font-family: var(--calm-font-ui);
  font-size: var(--calm-type-ui-size);
  font-weight: var(--calm-weight-ui);
`

/** Re-reads a rect whenever the page scrolls or resizes, so floating UI stays attached. */
export function useViewportChanges(onChange: () => void) {
  useLayoutEffect(() => {
    window.addEventListener('scroll', onChange, true)
    window.addEventListener('resize', onChange)
    return () => {
      window.removeEventListener('scroll', onChange, true)
      window.removeEventListener('resize', onChange)
    }
  }, [onChange])
}

/** The soft, raised surface shared by the Selection Bubble and the Insert Menu. */
export const FloatingSurface = styled.div<{$round?: boolean}>`
  padding: var(--calm-space-xs);
  border-radius: ${({$round}) => ($round ? 'var(--calm-radius-pill)' : 'var(--calm-radius-large)')};
  background: var(--calm-color-surface);
  box-shadow: var(--calm-color-floating-shadow);

  [data-scheme='dark'] & {
    box-shadow: inset 0 0 0 1px var(--calm-color-rule);
  }

  @media (prefers-reduced-motion: no-preference) {
    animation: calm-float-in var(--calm-motion-gentle) var(--calm-motion-easing);
  }

  @keyframes calm-float-in {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
  }
`
