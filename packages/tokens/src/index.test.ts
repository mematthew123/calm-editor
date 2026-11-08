import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import {palette, toCss, type Scheme} from './index.ts'

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe.each<Scheme>(['light', 'dark'])('%s palette', (scheme) => {
  const p = palette[scheme]

  it('keeps prose comfortably legible without being harsh', () => {
    const ratio = contrast(p.ink, p.paper)
    expect(ratio).toBeGreaterThanOrEqual(10)
    expect(ratio).toBeLessThan(16)
  })

  it.each(['inkMuted', 'accent', 'caution'] as const)('%s meets WCAG AA on paper', (token) => {
    expect(contrast(p[token], p.paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('meets WCAG AA for text on the accent', () => {
    expect(contrast(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5)
  })

  it('meets WCAG AA for prose on a raised surface', () => {
    expect(contrast(p.ink, p.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(p.inkMuted, p.surface)).toBeGreaterThanOrEqual(4.5)
  })
})

it('tokens.css is up to date with the source tokens', () => {
  const committed = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8')
  expect(committed, 'Run `pnpm --filter @calm/tokens build`').toBe(toCss())
})
