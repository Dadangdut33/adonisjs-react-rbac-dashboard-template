type JsonRecord = Record<string, unknown>

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

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
const createWhitespaceTextNode = (): JsonRecord => ({ type: 'text', text: ' ' })

const joinTextFragments = (fragments: string[]) => {
  return fragments.reduce((result, fragment) => {
    if (!fragment) return result
    if (!result) return fragment

    const previousChar = result[result.length - 1]
    const nextChar = fragment[0]
    const hasWhitespaceBoundary = /\s$/.test(result) || /^\s/.test(fragment)

    if (!hasWhitespaceBoundary && shouldInsertBoundarySpace(previousChar, nextChar)) {
      return `${result} ${fragment}`
    }

    return `${result}${fragment}`
  }, '')
}

const sanitizeMarks = (value: unknown) => {
  if (!Array.isArray(value)) return undefined

  const marks = value
    .filter(isRecord)
    .map((mark) => {
      if (typeof mark.type !== 'string' || !mark.type.trim()) return null

      const nextMark: JsonRecord = { type: mark.type }
      if (isRecord(mark.attrs)) {
        nextMark.attrs = mark.attrs
      }

      return nextMark
    })
    .filter((mark): mark is JsonRecord => mark !== null)

  return marks.length > 0 ? marks : undefined
}

const extractTextContent = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return joinTextFragments(value.map((item) => extractTextContent(item)).filter(Boolean))
  }
  if (!isRecord(value)) return ''

  if (typeof value.text === 'string') return value.text
  if (Array.isArray(value.content)) return extractTextContent(value.content)
  return ''
}

const sanitizeNode = (value: unknown): JsonRecord | null => {
  if (!isRecord(value)) return null
  if (typeof value.type !== 'string' || !value.type.trim()) return null

  if (value.type === 'text') {
    const text = typeof value.text === 'string' ? value.text : extractTextContent(value.content)
    if (!text) return null

    const nextTextNode: JsonRecord = {
      type: 'text',
      text,
    }

    const marks = sanitizeMarks(value.marks)
    if (marks) nextTextNode.marks = marks

    return nextTextNode
  }

  const nextNode: JsonRecord = {
    type: value.type,
  }

  if (isRecord(value.attrs)) {
    nextNode.attrs = value.attrs
  }

  if (Array.isArray(value.content)) {
    const content = value.content
      .map((item) => sanitizeNode(item))
      .filter((item): item is JsonRecord => item !== null)

    for (let index = 0; index < content.length - 1; index++) {
      const current = content[index]
      const next = content[index + 1]

      if (current.type !== 'text' || next.type !== 'text') continue

      const currentText = typeof current.text === 'string' ? current.text : ''
      const nextText = typeof next.text === 'string' ? next.text : ''
      if (!currentText || !nextText) continue

      const currentLastChar = currentText[currentText.length - 1]
      const nextFirstChar = nextText[0]
      const hasWhitespaceBoundary = /\s$/.test(currentText) || /^\s/.test(nextText)

      if (!hasWhitespaceBoundary && shouldInsertBoundarySpace(currentLastChar, nextFirstChar)) {
        content.splice(index + 1, 0, createWhitespaceTextNode())
        index++
      }
    }

    if (content.length > 0) {
      nextNode.content = content
    }
  }

  return nextNode
}

export const sanitizeTiptapContent = <T>(value: T): T => {
  const sanitized = sanitizeNode(value)

  if (!sanitized) {
    return { type: 'doc', content: [] } as T
  }

  if (sanitized.type !== 'doc') {
    return {
      type: 'doc',
      content: [sanitized],
    } as T
  }

  if (!Array.isArray(sanitized.content)) {
    sanitized.content = []
  }

  return sanitized as T
}
