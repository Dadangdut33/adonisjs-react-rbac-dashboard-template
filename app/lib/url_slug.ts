export function toSafeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildBlogUrlPath(title: string, slugId: string): string {
  const safeTitle = toSafeSlug(title)
  return safeTitle ? `/blog/${safeTitle}-${slugId}` : `/blog/${slugId}`
}
