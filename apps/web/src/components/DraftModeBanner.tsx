/** Shown while previewing drafts from the Writing Room. Leaving uses a form POST so prefetching can't end it. */
export function DraftModeBanner() {
  return (
    <aside
      role="status"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit items-center gap-3 rounded-full bg-surface px-4 py-2 font-ui text-sm text-ink-muted shadow-[var(--calm-color-floating-shadow)]"
    >
      Previewing a draft
      <form action="/api/draft-mode/disable" method="post">
        <button type="submit" className="cursor-pointer rounded-full px-2 py-1 text-ink hover:bg-paper">
          Leave preview
        </button>
      </form>
    </aside>
  )
}
