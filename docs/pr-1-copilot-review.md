# PR #1 — Copilot review comments

> **Paths have moved.** This record predates the Writing Room becoming a plugin. `apps/studio/src/writing-room/` is now `packages/writing-room/src/room/`; `apps/studio/src/actions/` and `apps/studio/src/lib/{slug,publish-details,slug-availability,image-url}.ts` are in `packages/writing-room/src/`; and `apps/studio/schemaTypes/` is `packages/writing-room/src/schema/`. See [`plugin-roadmap.md`](plugin-roadmap.md).

Source: [PR #1 "Stage 1: Foundations — Writing Room, publishing, and Reading Site"](https://github.com/mematthew123/calm-editor/pull/1), reviewed by `copilot-pull-request-reviewer` (12 inline comments, 3 high / 9 medium). The PR was merged with all 12 open; fixes live on branch `fix/pr1-copilot-review`.

| # | Severity | File | Verdict | Status |
|---|----------|------|---------|--------|
| 1 | High | `apps/studio/src/writing-room/Room.tsx:176` | Valid | Fixed (with #2) |
| 2 | High | `apps/studio/src/writing-room/empty-post.ts:15` | Valid | Fixed |
| 3 | High | `apps/studio/src/writing-room/room-status.tsx:170` | Valid | Fixed |
| 4 | Medium | `apps/studio/schemaTypes/objects/body.ts:77` | Valid | Fixed |
| 5 | Medium | `apps/studio/src/actions/publish-post.ts:23` | Valid | Fixed (with #11) |
| 6 | Medium | `apps/studio/src/lib/publish-details.ts:35` | Valid | Fixed |
| 7 | Medium | `apps/studio/src/writing-room/editor/SelectionBubble.tsx:42` | Partly valid | Fixed |
| 8 | Medium | `apps/studio/src/writing-room/editor/blocks/CodeBlock.tsx:50` | Valid | Fixed |
| 9 | Medium | `apps/studio/src/writing-room/editor/floating.tsx:35` | Valid | Fixed |
| 10 | Medium | `apps/studio/src/writing-room/editor/use-block-field.ts:31` | Valid | Fixed (verify manually) |
| 11 | Medium | `apps/studio/src/writing-room/room-status.tsx:175` | Valid | Fixed |
| 12 | Medium | `packages/content/src/embed.ts:45` | Valid | Fixed |

---

## 1. Entering the Writing Room can discard drafts with saved Details — High

> This also discards existing drafts opened from the standard form, not just abandoned Posts created in the Lobby. `isEmptyPost` ignores Details, so a draft with a saved excerpt, cover image, or tags but no title/body is deleted merely by entering the Writing Room and leaving it. Restrict automatic discard to newly created abandoned Posts and ensure saved Details are preserved.

**Verdict: valid.** `LeaveButton` discards any unpublished Post that `isEmptyPost` calls empty, and that check only looked at `title` and `body`.

**Fix:** see #2. `LeaveButton` now passes the whole document to `isEmptyPost`, so any saved Detail blocks the discard. I didn't add "only Posts created this session" tracking: once Details count, a Post that still gets discarded has nothing in it at all.

## 2. Saved Details are ignored when deciding whether to discard a draft — High

> This check ignores every Details field. A never-published draft with an excerpt, cover image, tags, or manually configured slug but no title/body is considered empty; opening it in the Writing Room and clicking Leave then calls `discardDocument` and deletes that saved work. Include meaningful Details in the emptiness check, or restrict automatic discard to untouched drafts created by the current 'Start a new Post' session.

**Verdict: valid.**

**Fix:** `isEmptyPost` now also needs every non-system field to be empty. A field counts as empty when it has no non-blank string, no non-empty array and no non-null value, apart from `_type`/`_key`. So `slug: {current: ''}` and `tags: []` are still empty, while an excerpt, a cover-image asset ref, tags, a hand-set slug or a `publishedAt` is not. Tests added in `empty-post.test.ts`.

## 3. Publish timeout bypasses sync and validation checks — High

> Once the four-second timeout fires, this condition permits publishing even while the document is unsynced or validation is still running. The following code consumes potentially stale validation markers and invokes the SDK publish action, which does not enforce the Studio schema on the server. A slow validation can therefore let invalid content through. On timeout, return to idle with a retry message rather than bypassing these checks.

**Verdict: valid.** `!(isSynced && !validation.isValidating) && !timedOut` let the publish continue after the timeout.

**Fix:** when the document is unsynced or still validating, `PublishButton` waits. On timeout it goes back to idle and shows "Still saving your latest changes. Try publishing again in a moment." It never publishes on stale state.

## 4. Required validation accepts Portable Text with only blank paragraphs — Medium

> `required()` does not reject a Portable Text array containing only blank paragraphs. A Writer can enter a title, create an empty body paragraph, and publish a Post with no body content despite the 'Write something before publishing' requirement. Add a content check that rejects arrays whose text blocks are all empty or whitespace, while retaining support for non-text body objects.

**Verdict: valid.** The editor almost always leaves at least one empty block behind, so `required()` alone rarely triggers.

**Fix:** the body's required rule now also runs a `hasProse` custom check. A body passes if any block is a non-text object (image, embed, code, section break) or any text block has non-whitespace text. Otherwise it fails with "Write something before publishing." The marker path is the body field itself, so the Room's go-to-problem still focuses the body.

## 5. Slug collision cannot be resolved while Publish is disabled — Medium

> Forwarding the original action's `disabled` state prevents this handler from running when the draft slug is already in use: the built-in Publish action is disabled by Sanity's slug validation. Consequently, the `uniqueSlug` logic below cannot resolve a collision from the standard form. Arrange slug settlement before the built-in action becomes publishable, or provide an action that can resolve this specific error without bypassing other validation failures.

**Verdict: valid.** The `slug` type's built-in uniqueness check fails, which disables Publish before `detailsForPublish` can append `-2`.

**Fix (shared with #11):** the `slug` field in `schemaTypes/documents/post.ts` now has a custom `options.isUnique` (`isUniqueOncePublished`):
- **Never-published Post:** a clash is not an error, because publishing settles it (`notes` → `notes-2`). This matches the field description: the slug "follows the title until the Post is first published".
- **Published Post:** it falls back to Sanity's `defaultIsUnique`. The slug stays put after the first publish, so a clash caused by a hand edit is still a real error.

`publish-post.ts` itself is unchanged. Other validation errors still disable Publish as before.

## 6. Non-Latin titles can publish without a usable slug — Medium

> A valid title containing only non-Latin characters (for example, `静かな朝`) produces an empty string from `slugify`. This branch then leaves the slug unset but still lets both publish flows succeed. The Reading Site filters out Posts without `slug.current`, so the newly published Post is inaccessible. Use a nonempty fallback slug and pass it through `uniqueSlug` when the title cannot produce one.

**Verdict: valid.**

**Fix:** `detailsForPublish` falls back to the base `post` when the title gives an empty slug, and runs it through `uniqueSlug` (`post`, `post-2`, …). Test added.

*Open question for you:* would you rather allow Unicode slugs (e.g. `/posts/静かな朝`) instead? That would mean changing `slugify` and checking that the Reading Site's `[slug]` route decodes params correctly, so I went with the smaller fix.

## 7. Formatting toolbar unmounts when focus moves to its buttons — Medium

> When focus moves from the selected text to a formatting button, `BodyEditor` handles the editor's `blurred` event by setting `editorFocused` to false. This expression then unmounts the toolbar, removing the focused button before its keyboard handler can be used. Keep the bubble visible while focus is within either the editor or the bubble, and hide it only when focus leaves both.

**Verdict: partly valid.** Mouse use was fine, because the buttons `preventDefault` on mousedown and never take focus. The keyboard problem was worse than Copilot says: the bubble is portaled to `<body>`, so Tab from the editor never lands on it, and its `onKeyDown` handlers could never run.

**Fix:**
- The bubble stays visible while focus is inside it (a `toolbarFocused` state set from focus/blur on the surface). It hides only when focus leaves both the editor and the bubble.
- **Alt+F10** (the usual "go to editor toolbar" shortcut) moves focus to the first button while text is selected.
- **Esc** on a toolbar button sends focus back to the text without leaving the Room.

## 8. Code editor traps keyboard users by intercepting Shift+Tab — Medium

> This intercepts both Tab and Shift+Tab and inserts spaces for either key. Because the surrounding `Isolate` also stops Escape from reaching the Room's leave handler, a keyboard-only user cannot move focus out of the Code textarea. Preserve an exit gesture, at least by allowing Shift+Tab to perform normal backward focus navigation.

**Verdict: valid.**

**Fix:** only a plain Tab (no Shift/Alt/Meta/Ctrl) inserts two spaces. Shift+Tab is left to the browser and moves focus back to the language picker and beyond.

## 9. Insert menu can extend below the viewport — Medium

> Both Insert Menu variants request `placement="below"`, but this calculation never checks whether the menu fits below the anchor. Opening it near the bottom of the viewport places its later commands off-screen. Check the available space below too, flip above when needed, and clamp the vertical position to the viewport.

**Verdict: valid.**

**Fix:** `Floating` now checks the space on both sides. It uses the preferred side if it fits, flips to the other side if only that one fits, and always clamps `top` to `[EDGE, innerHeight − height − EDGE]`.

## 10. Unmounting the Room can discard debounced edits — Medium

> Unmounting the Room before the 400 ms debounce expires cancels the pending write without saving it. For example, browser Back immediately after editing code or an image caption can remove the input without firing its blur handler, losing the last edits even though the SDK has no unsynced changes. Commit changes to the SDK as they are entered, or flush pending field edits at the navigation boundary while the editor is still mounted.

**Verdict: valid.** The unmount cleanup only did `clearTimeout`.

**Fix:** `useBlockField` now flushes a pending write when it unmounts instead of dropping it. The flush runs in a `useLayoutEffect` cleanup. React runs those before passive cleanups, and `EditorProvider` stops its actors in a passive `useEffect` cleanup (checked in `@portabletext/editor@8.2.12`), so the `block.set` reaches a live editor.

**Please check this one by hand:** type in a code block or image caption and press browser Back within about 400 ms, then reopen the Post. I confirmed the ordering from the library source but couldn't run it in a browser here. If the SDK sync plugin drops edits made during teardown, the fallback is to write on every keystroke, as Copilot suggested.

## 11. Slug uniqueness validation blocks automatic collision resolution — Medium

> When a new Post's generated slug clashes with an existing Post, Sanity's built-in slug uniqueness validation produces an error here. This returns before `detailsForPublish` can append `-2`, so the automatic collision resolution never runs for Posts whose slug already follows the title. Settle the first-publish slug before checking the resulting document's validation errors, then wait for that edit to validate.

**Verdict: valid.** This is the Writing Room side of #5.

**Fix:** the same `isUniqueOncePublished` validator as #5. Before the first publish there is no uniqueness error, so the Room's flow reaches `detailsForPublish` and settles the slug. After the first publish, a hand-set clashing slug sends the Writer to Details, which follows ADR 0002.

## 12. Vimeo privacy hashes are dropped from generated player URLs — Medium

> The unlisted Vimeo URL already included in `embed.test.ts` contains a privacy hash after the video ID, but this parser discards it. `embedPlayerUrl` consequently generates a player URL without the required `h` parameter, so unlisted videos fail in both the Studio preview and Reading Site. Preserve the hash from share URLs and player URLs, include it in the player query, and test the parse-to-player round trip.

**Verdict: valid.**

**Fix:** `ParsedEmbed` has a new optional `hash`. The parser reads it from the segment after the ID (`vimeo.com/ID/HASH`) or from `?h=` (`player.vimeo.com/video/ID?h=HASH`). `embedPlayerUrl` then emits `?h=HASH&dnt=1`. Tests cover both URL forms and the share-link → player-URL round trip.

---

## Verification

- `apps/studio`: `vitest run` (61 tests pass), `tsc --noEmit` clean, `eslint src schemaTypes` clean.
- `packages/content`: `vitest run` (25 tests pass), `tsc --noEmit` clean.
- `apps/web`: `tsc --noEmit` clean, since it uses `parseEmbedUrl` and `embedPlayerUrl`.
- Not exercised in a browser: #7 (Alt+F10 and focus handling), #9 (menu flip near the bottom of the window) and #10 (flush on Back).
