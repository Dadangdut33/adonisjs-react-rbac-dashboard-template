import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import VideoAttachmentNodeView from '../components/video/video-attachment-node-view'

export interface VideoAttachmentOptions {
  HTMLAttributes: Record<string, string>
}

export const VideoAttachment = Node.create<VideoAttachmentOptions>({
  name: 'videoAttachment',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-url') || '',
        renderHTML: (attributes) => ({ 'data-url': String(attributes.url || '') }),
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-name') || '',
        renderHTML: (attributes) => ({ 'data-name': String(attributes.name || '') }),
      },
      mimeType: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-mime-type') || '',
        renderHTML: (attributes) => ({ 'data-mime-type': String(attributes.mimeType || '') }),
      },
      extension: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-extension') || '',
        renderHTML: (attributes) => ({ 'data-extension': String(attributes.extension || '') }),
      },
      size: {
        default: 0,
        parseHTML: (element) => Number.parseInt(element.getAttribute('data-size') || '0', 10) || 0,
        renderHTML: (attributes) => ({ 'data-size': String(attributes.size || 0) }),
      },
      cardSize: {
        default: 'md',
        parseHTML: (element) => element.getAttribute('data-card-size') || 'md',
        renderHTML: (attributes) => ({ 'data-card-size': String(attributes.cardSize || 'md') }),
      },
      position: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-position') || 'center',
        renderHTML: (attributes) => ({ 'data-position': String(attributes.position || 'center') }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-video-attachment]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-video-attachment': 'true',
        'class': 'video-attachment-node',
        ...HTMLAttributes,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoAttachmentNodeView)
  },
})

export default VideoAttachment
