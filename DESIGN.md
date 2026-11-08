---
name: Calm Editor
colors:
  paper: "#FAF7F2"
  surface: "#F2ECE3"
  rule: "#E7DFD4"
  ink: "#2E2823"
  ink-muted: "#6E645B"
  ink-faint: "#A3988C"
  accent: "#A8532F"
  on-accent: "#FAF7F2"
  selection: "rgba(168, 83, 47, 0.18)"
  caution: "#8A5300"
  paper-dark: "#1E1B18"
  surface-dark: "#28241F"
  rule-dark: "#35302A"
  ink-dark: "#EDE6DB"
  ink-muted-dark: "#ADA295"
  ink-faint-dark: "#6F665C"
  accent-dark: "#E39A78"
  on-accent-dark: "#1E1B18"
  selection-dark: "rgba(227, 154, 120, 0.24)"
  caution-dark: "#E5B567"
typography:
  title:
    fontFamily: Newsreader
    fontSize: 2.25em
    fontWeight: 500
    lineHeight: 1.25
  heading:
    fontFamily: Newsreader
    fontSize: 1.5em
    fontWeight: 600
    lineHeight: 1.25
  subheading:
    fontFamily: Newsreader
    fontSize: 1.2em
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: Newsreader
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.65
  body-small:
    fontFamily: Newsreader
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
  body-large:
    fontFamily: Newsreader
    fontSize: 1.375rem
    fontWeight: 400
    lineHeight: 1.65
  caption:
    fontFamily: Newsreader
    fontSize: 0.85em
    fontWeight: 400
  code:
    fontFamily: ui-monospace
    fontSize: 0.85em
    fontWeight: 400
  ui:
    fontFamily: Figtree
    fontSize: 0.875rem
    fontWeight: 450
  ui-strong:
    fontFamily: Figtree
    fontSize: 0.875rem
    fontWeight: 600
  ui-small:
    fontFamily: Figtree
    fontSize: 0.8125rem
    fontWeight: 450
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  xxl: 4rem
  prose-gap: 1em
  measure: 38rem
rounded:
  sm: 0.5rem
  lg: 0.875rem
  pill: 999px
components:
  room-controls:
    textColor: "{colors.ink-muted}"
    typography: "{typography.ui}"
  sync-status:
    textColor: "{colors.ink-muted}"
    typography: "{typography.ui-small}"
  sync-status-offline:
    textColor: "{colors.caution}"
    typography: "{typography.ui-small}"
  publish-button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.ui-strong}"
    rounded: "{rounded.pill}"
    padding: 0.5rem 1rem
  quiet-button:
    textColor: "{colors.ink-muted}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: 0.5rem 0.75rem
  selection-bubble:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: 0.25rem
  insert-menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.lg}"
    padding: 0.5rem
  link:
    textColor: "{colors.accent}"
  quote:
    textColor: "{colors.ink-muted}"
    typography: "{typography.body}"
  code-block:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.sm}"
    padding: 1rem
  embed-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.ui}"
    rounded: "{rounded.lg}"
    padding: 1rem
  section-break:
    textColor: "{colors.ink-faint}"
    typography: "{typography.body}"
  lobby-post:
    textColor: "{colors.ink}"
    typography: "{typography.subheading}"
    rounded: "{rounded.lg}"
    padding: 1rem
---

# Calm Editor design

The visual and interaction language of the Writing Room, the Studio around it, and the Reading Site.

**Source of truth:** token values live in [`packages/tokens/src/index.ts`](./packages/tokens/src/index.ts). The front matter above mirrors them for people and agents, and a test in `@calm/tokens` fails if the two disagree. Change the tokens first, then this file.

## Overview

Calm, soft, approachable. The Writing Room should feel like a quiet desk by a window, not like software. Five principles carry every decision:

1. **The Prose is the loudest thing on screen.** Nothing — not a button, not a badge, not an Embed — may draw the eye harder than the words being written.
2. **One accent, used sparingly.** Clay marks the caret, the selection, links, and Publish. If two clay things are visible at once outside the Prose, one of them is wrong.
3. **Recede, don't vanish.** Room Controls fade while the Writer types and return when they pause. They're always findable, never hidden behind a gesture to learn.
4. **Nothing is urgent unless it truly is.** Only lost connectivity, a blocked publish, or another person in the Post may hold attention. Everything else waits quietly.
5. **Warm, not cute.** Soft corners, warm neutrals and friendly words — but no mascots, confetti, emoji or exclamation marks.

## Colors

Warm paper and warm ink, never pure white or black. Pure `#fff` on a large screen is the single most tiring thing in most editors.

- **Paper** is the page. **Surface** is a barely-raised tint for things that sit *on* the page: Code Blocks, Embed cards, the Selection Bubble and Insert Menu.
- **Ink** is for Prose only. **Ink muted** is for Room Controls, captions and placeholders. **Ink faint** is decorative only (the Section Break ornament, disabled states) and must never carry meaning on its own.
- **Rule** is for hairlines. Use it rarely; whitespace separates better.
- **Accent (clay)** for the caret, selection highlight, links and Publish — nothing else.
- **Caution** for the few messages that must not recede: offline, and a publish that's blocked.

**Dusk (dark mode)** uses the `-dark` tokens: warm charcoal paper, cream ink, and a lighter clay so the accent still reads. The Writing Room follows the Studio's colour scheme; the Reading Site follows the reader's system preference. In CSS, set `data-scheme="dark"` or `"light"` on an ancestor to force a scheme; otherwise the system preference applies.

**Contrast:** Prose sits between 10:1 and 16:1 against paper — comfortably legible without harshness. Ink muted, accent and caution all meet WCAG AA (4.5:1) on paper and on surface. These are enforced by tests.

## Typography

Two typefaces, each with one job:

- **Newsreader** (variable, with optical sizes) for everything that is Prose: title, body, headings, quotes, captions. Let the browser pick the optical size (`font-optical-sizing: auto`) so the title and body each get the right cut.
- **Figtree** (variable) for everything that is *not* Prose: Room Controls, the Lobby's chrome, the Studio UI. The change of typeface is how the Writer knows a thing isn't part of their writing.
- **System monospace** for Code Blocks.

Prose sizes are relative to the body size, which the Writer chooses in Room Settings: **small** (`body-small`), **medium** (`body`, default) or **large** (`body-large`). Title, heading, subheading, caption and code are `em`-based so the whole page scales together.

- The **title** is the page's only `h1`. Bodies use **Heading** (`h2`) and **Subheading** (`h3`); never label them "H2/H3" to Writers.
- Keep the measure at `38rem` (~68 characters). Never let Prose run wider, even on a large monitor.
- Use `text-wrap: pretty` on Prose and `text-wrap: balance` on the title and headings.
- Quotes are body size, in ink muted, with a soft clay rule on the inline-start edge — not italicised wholesale and not enlarged.

## Layout

A single centred column, the width of the measure, with generous space above the title (at least `xxl`) so the first line never feels crammed against the top of the window.

- **Writing Room:** nothing but the column. Room Controls sit in the corners of the viewport, outside the column, so they never overlap Prose: Leave at top-start; sync status, word count and Room Settings at top-end; Publish at bottom-end or top-end depending on width. Presence ("Sam is here too") sits beside the sync status.
- **Lobby:** the same column. "Start a new Post" first and largest, then a short list of recent Posts, then a quiet "All Posts →" link.
- Prose blocks are separated by `prose-gap` (`1em`); headings get roughly double that above them and the standard gap below, so they belong to what follows.
- Images, Embeds and Code Blocks stay within the measure. Nothing bleeds full-width in v1.
- **Devices:** desktop and tablet are the target. On a phone the room still works but isn't optimised; the Lobby and Reading Site must be fully responsive.

## Elevation & Depth

Almost flat. Depth comes from the paper/surface tint, not shadows.

- Only two things float: the **Selection Bubble** and the **Insert Menu**. In light mode they carry the soft `floatingShadow` token; in dusk they drop the shadow and use a `rule` border instead (shadows don't read on dark paper).
- Code Blocks and Embed cards sit *on* the page: surface tint, no shadow, no border.
- Never stack elevations (no card inside a card inside a panel).

## Shapes

Soft, consistent corners.

- `sm` (`0.5rem`) for Code Blocks and images in Prose.
- `lg` (`0.875rem`) for the Insert Menu, Embed cards and Lobby rows.
- `pill` for buttons, the Selection Bubble, and status chips.
- When rounding nests, inner radius = outer radius − padding, so curves stay concentric.

## Components

- **Room Controls** — Figtree, ink muted, no backgrounds or borders until hovered/focused. They recede to near-invisible after a few keystrokes and return on pointer movement, a ~2s pause, or keyboard focus. Anything caution-toned (offline, blocked publish) and presence ignore the recede.
- **Publish button** — the only filled, clay element in the room. Labels: "Publish" (never published), "Publish changes" (published with edits); hidden when there's nothing to publish.
- **Quiet button** — the default for every other control: text-only in ink muted, a surface-tinted pill on hover/focus.
- **Sync status** — a small "Saved" that fades after a moment. Offline switches to caution and stays: "Offline — your words are safe here and will sync when you're back."
- **Selection Bubble** — a surface pill above selected text: Bold, Italic, Link, Heading, Subheading, Quote. Appears with the `gentle` motion, never covers the selected line.
- **Insert Menu** — opened from the faint `+` in the margin of an empty line, or `/` at the start of an empty line. A short list with an icon and a plain-language label each: Image, Embed, Code block, Section break, Quote, List.
- **Image** — at the measure, `sm` corners. Beneath it, in Figtree: "Describe this image for people who can't see it" and "Add a caption (optional)" as quiet inline placeholders until clicked.
- **Embed card** — a quiet surface card with provider name, caption or URL, and a "Preview" toggle. Never a live, autoplaying player by default.
- **Code Block** — surface tint, monospace, no line numbers and no syntax colouring in the room (the Reading Site highlights). Language label in Figtree, ink muted, top-end.
- **Section Break** — a centred `✦ ✦ ✦` in ink faint with a full `xl` of space either side.
- **Lobby post row** — title in Newsreader at subheading size, then a single Figtree line: status ("Draft", "Published", "Published · unpublished changes") and relative time ("2 hours ago").

## Motion

Unhurried and small. Motion explains a change; it never decorates.

- `gentle` (200ms) for small responses: hover, the Selection Bubble and Insert Menu appearing.
- `recede` (700ms) for Room Controls fading out and back. Slow enough that the Writer feels it rather than sees it.
- One easing everywhere: `cubic-bezier(0.22, 1, 0.36, 1)` — quick to start, soft to settle.
- Opacity and small translations (≤ 4px) only. No scaling, bouncing or sliding panels.
- Under `prefers-reduced-motion`, changes are instant, and Room Controls never drop below readable contrast while they have keyboard focus.

## Voice & Copy

Plain, warm, brief. Write like a considerate person sitting beside the Writer.

- Say what happened and what to do, in that order: "This link isn't from YouTube, Vimeo or Spotify." not "Invalid URL."
- Frame requirements as help: "Describe this image for people who can't see it."
- Sentence case everywhere. No exclamation marks, no emoji, no "Oops".
- Use the glossary's words (Post, Details, Writing Room), never their _Avoid_ alternatives.
- Reassure only when it's true and useful: "Your words are safe here" appears only when we're actually holding unsynced edits.

## Using the tokens in code

**Reuse the token, don't fork it.** Every value above already exists in `@calm/tokens`. If you're about to type a hex code, a font stack, a radius or a duration, stop and find the token.

For any styling value, work down this list and stop at the first that applies:

1. **A CSS custom property** — `var(--calm-color-ink)`, `var(--calm-font-prose)`, `var(--calm-radius-large)`, `var(--calm-motion-recede)`. Colour properties re-resolve per scheme, so the component works in light and dusk with no extra work. Import `@calm/tokens/tokens.css` once at the app's root.
2. **The TypeScript export** — `import {palette, fonts} from '@calm/tokens'` — only where CSS variables can't reach: the Studio theme (`buildTheme` needs literal colours), canvas, or an SVG data URI.
3. **A literal** — never. Add a token instead, update this file, and let the tests confirm contrast.

Naming in CSS is `--calm-{group}-{token}` in kebab-case: `--calm-color-ink-muted`, `--calm-type-heading`, `--calm-space-lg`, `--calm-weight-title`.

## Do's and Don'ts

**Do**
- Let whitespace do the separating before reaching for a border.
- Keep every surface warm — tint neutrals toward the paper, never toward blue.
- Keep only one clay thing outside the Prose at a time.
- Test every new colour in both light and dusk, and keep the contrast tests green.

**Don't**
- Don't use pure white, pure black, or cool greys.
- Don't add a fixed toolbar, a sidebar, or anything persistent beside the column.
- Don't animate anything while the Writer is typing except the receding Room Controls.
- Don't show counts, streaks, goals or progress pressure.
- Don't put a destructive action (unpublish, delete, discard) anywhere in the Writing Room.
