interface PostContent {
  title?: unknown
  body?: unknown
}

interface Block {
  _type?: string
  children?: Array<{text?: unknown}>
}

/** A Post with no title and no words or objects in its body: safe to discard when the Writer leaves. */
export function isEmptyPost(post: PostContent | null | undefined): boolean {
  if (!post) return true
  if (typeof post.title === 'string' && post.title.trim()) return false
  const body = Array.isArray(post.body) ? (post.body as Block[]) : []
  return body.every(
    (block) =>
      block._type === 'block' &&
      (block.children ?? []).every((child) => typeof child.text !== 'string' || !child.text.trim()),
  )
}
