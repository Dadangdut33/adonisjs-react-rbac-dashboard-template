'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface JsonViewerProps {
  data: object
  title?: string
}

export default function JsonViewer({ data, title = 'JSON Output' }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)

  const formattedJson = JSON.stringify(data, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2 text-xs">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-96">
          <code>{formattedJson}</code>
        </pre>
      </CardContent>
    </Card>
  )
}
