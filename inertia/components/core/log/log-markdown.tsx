import { Box, Skeleton } from '@mantine/core'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useEffect, useState } from 'react'
import { cn } from '~/lib/utils'

import classes from './log-markdown.module.css'

export function LogMarkdown({
  markdown,
  className = 'log-table',
}: {
  markdown: string
  className?: string
}) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function parse() {
      const raw = await marked.parse(markdown, { gfm: true, breaks: true, async: true })
      const clean = DOMPurify.sanitize(raw)

      if (!cancelled) {
        setHtml(clean)
        setLoading(false)
      }
    }

    parse()

    return () => {
      cancelled = true
    }
  }, [markdown])

  if (loading) return <Skeleton height={100} />

  return (
    <Box className={cn(classes.markdown, className)} dangerouslySetInnerHTML={{ __html: html }} />
  )
}
