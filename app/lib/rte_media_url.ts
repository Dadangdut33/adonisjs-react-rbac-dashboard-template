import router from '@adonisjs/core/services/router'

const REDIRECT_PATH_REGEX = /^\/api\/v1\/public\/media\/redirect\/([^/?#]+)$/
const MEDIA_NODE_URL_FIELD: Record<string, string> = {
  image: 'src',
  fileAttachment: 'url',
  audioAttachment: 'url',
  videoAttachment: 'url',
}

const toTempUrl = (value: string) => {
  try {
    return new URL(value)
  } catch {
    return new URL(value, 'http://localhost')
  }
}

const extractMediaIdFromUrl = (value: string): string | null => {
  if (!value || typeof value !== 'string') return null

  const parsed = toTempUrl(value)
  const match = parsed.pathname.match(REDIRECT_PATH_REGEX)
  if (!match) return null

  return decodeURIComponent(match[1])
}

const makeUnsignedMediaRedirectUrl = (id: string) => {
  return router.builder().params({ id }).make('api.v1.media.redirect')
}

const makeSignedMediaRedirectUrl = (id: string) => {
  return router.builder().params({ id }).makeSigned('api.v1.media.redirect', { expiresIn: '1h' })
}

const cloneValue = <T>(value: T): T => {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value))
  }
}

const isWordLikeChar = (value: string) => /[\p{L}\p{N}]/u.test(value)
const isOpeningPunctuation = (value: string) => /[([{]/.test(value)
const isEmojiChar = (value: string) => /\p{Extended_Pictographic}/u.test(value)
const isVisibleBoundaryChar = (value: string) =>
  isWordLikeChar(value) || isOpeningPunctuation(value) || isEmojiChar(value)
const needsLeadingSpace = (value: string) => !/\s/u.test(value) && isVisibleBoundaryChar(value)
const punctuationNeedsFollowingSpace = (previousChar: string, nextChar: string) => {
  if (!isVisibleBoundaryChar(nextChar) || /\p{N}/u.test(nextChar)) return false
  return /[.!?:;,]/.test(previousChar)
}
const shouldInsertBoundarySpace = (previousChar: string, nextChar: string) =>
  (isWordLikeChar(previousChar) && (isWordLikeChar(nextChar) || needsLeadingSpace(nextChar))) ||
  punctuationNeedsFollowingSpace(previousChar, nextChar)
const createWhitespaceTextNode = () => ({ type: 'text', text: ' ' })

/**
 * ProseMirror stores marks by splitting text into adjacent text nodes.
 * During editing, users can end up with boundaries like:
 *   "after" + {strong}"procrastinating"
 * which serialize without a space in HTML output.
 *
 * This pass inserts an unmarked whitespace text node at text-node boundaries
 * when both sides look like word characters and no whitespace already exists.
 * Using a dedicated text node avoids inheriting marks from either side.
 */
const normalizeInlineTextSpacing = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const normalizedChildren = value.map((item) => normalizeInlineTextSpacing(item))

    for (let index = 0; index < normalizedChildren.length - 1; index++) {
      const current = normalizedChildren[index] as Record<string, unknown> | null
      const next = normalizedChildren[index + 1] as Record<string, unknown> | null

      if (!current || !next || typeof current !== 'object' || typeof next !== 'object') continue
      if (current.type !== 'text' || next.type !== 'text') continue

      const currentText = typeof current.text === 'string' ? current.text : ''
      const nextText = typeof next.text === 'string' ? next.text : ''
      if (!currentText || !nextText) continue

      const currentLastChar = currentText[currentText.length - 1]
      const nextFirstChar = nextText[0]
      const hasWhitespaceBoundary = /\s$/.test(currentText) || /^\s/.test(nextText)

      if (!hasWhitespaceBoundary && shouldInsertBoundarySpace(currentLastChar, nextFirstChar)) {
        normalizedChildren.splice(index + 1, 0, createWhitespaceTextNode())
        index++
      }
    }

    return normalizedChildren
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const result: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    result[key] = normalizeInlineTextSpacing(child)
  }

  return result
}

const walkAndTransform = (value: unknown, mode: 'normalize' | 'sign'): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => walkAndTransform(item, mode))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const data = value as Record<string, unknown>
  const result: Record<string, unknown> = {}

  for (const [key, child] of Object.entries(data)) {
    result[key] = walkAndTransform(child, mode)
  }

  const nodeType = typeof result.type === 'string' ? result.type : null
  const urlField = nodeType ? MEDIA_NODE_URL_FIELD[nodeType] : null

  if (urlField && result.attrs && typeof result.attrs === 'object') {
    const attrs = { ...(result.attrs as Record<string, unknown>) }
    const rawUrl = attrs[urlField]

    if (typeof rawUrl === 'string' && rawUrl.length > 0) {
      const mediaId = extractMediaIdFromUrl(rawUrl)
      if (mediaId) {
        attrs[urlField] =
          mode === 'normalize'
            ? makeUnsignedMediaRedirectUrl(mediaId)
            : makeSignedMediaRedirectUrl(mediaId)
      }
    }

    result.attrs = attrs
  }

  return result
}

export const normalizeRteMediaUrlsForSave = <T>(content: T): T => {
  if (!content) return content
  const cloned = cloneValue(content)
  const withSpacing = normalizeInlineTextSpacing(cloned)
  return walkAndTransform(withSpacing, 'normalize') as T
}

export const signRteMediaUrlsForOutput = <T>(content: T): T => {
  if (!content) return content
  const cloned = cloneValue(content)
  return walkAndTransform(cloned, 'sign') as T
}
