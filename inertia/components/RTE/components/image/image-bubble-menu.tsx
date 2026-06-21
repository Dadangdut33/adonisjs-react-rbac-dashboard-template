import { Editor } from '@tiptap/react'
import type React from 'react'

import { SelectedImageType } from '../../types'

export default function ImageBubbleMenu({
  editor,
  selectedImage,
  renderImagePopover,
  enableImagePopover = true,
}: {
  editor: Editor | null
  selectedImage: SelectedImageType
  renderImagePopover?: () => React.ReactNode
  enableImagePopover?: boolean
}) {
  if (!editor) return null
  if (!selectedImage) return null

  return <>{enableImagePopover && renderImagePopover ? renderImagePopover() : null}</>
}
