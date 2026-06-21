import { CopyButton, Select, Tooltip } from '@mantine/core'
import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Clipboard, ClipboardCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CODE_LANGUAGE_OPTIONS } from '~/components/RTE/code_languages'
import { Button } from '~/components/ui/button'

export default function CodeBlockNodeView({ editor, node, updateAttributes }: NodeViewProps) {
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const language = ((node.attrs?.language as string) || 'plaintext').toLowerCase()
  const value = node.textContent || ''

  useEffect(() => {
    const syncEditable = () => setIsEditable(!!editor?.isEditable)
    syncEditable()
    editor.on('transaction', syncEditable)
    editor.on('selectionUpdate', syncEditable)

    return () => {
      editor.off('transaction', syncEditable)
      editor.off('selectionUpdate', syncEditable)
    }
  }, [editor])

  const languageLabel = useMemo(
    () => CODE_LANGUAGE_OPTIONS.find((option) => option.value === language)?.label || language,
    [language]
  )

  return (
    <NodeViewWrapper
      className={`rte-codeblock not-prose my-3 ${!isEditable ? 'rte-codeblock--readonly' : ''}`}
    >
      <div className="rte-codeblock-card">
        <div className="rte-codeblock-header">
          <div>
            {isEditable ? (
              <Select
                data={CODE_LANGUAGE_OPTIONS}
                value={language}
                onChange={(value) => {
                  if (!value) return
                  updateAttributes({ language: value })
                }}
                size="xs"
                radius="sm"
                searchable
                clearable={false}
                w={180}
                placeholder="Select language"
                comboboxProps={{
                  withinPortal: true,
                  zIndex: 1200,
                }}
              />
            ) : (
              <div className="rte-codeblock-notch">{languageLabel}</div>
            )}
          </div>

          <div>
            <CopyButton value={value}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy to clipboard'} withArrow>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={copy}
                  >
                    {copied ? (
                      <ClipboardCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Clipboard className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </Tooltip>
              )}
            </CopyButton>
          </div>
        </div>

        <pre>
          {/* @ts-ignore */}
          <NodeViewContent as="code" className="hljs" />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}
