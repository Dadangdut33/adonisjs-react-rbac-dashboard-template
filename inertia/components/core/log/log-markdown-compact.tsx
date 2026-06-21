import { Text } from '@mantine/core'

type Props = {
  markdown: string
  maxChars?: number
  lineClamp?: number
}

function markdownToPlainText(markdown: string) {
  if (!markdown) return ''

  return markdown
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ' '))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[\*_~]/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function LogMarkdownCompact({ markdown, maxChars = 180, lineClamp = 2 }: Props) {
  const plainText = markdownToPlainText(markdown)
  const compactText =
    plainText.length > maxChars ? `${plainText.slice(0, Math.max(0, maxChars - 3)).trim()}...` : plainText

  return (
    <Text fz="sm" c="dimmed" lineClamp={lineClamp} title={plainText}>
      {compactText || '-'}
    </Text>
  )
}
