import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import YoutubeNodeView from '../components/youtube/youtube-node-view'

export interface YoutubeEmbedOptions {
  HTMLAttributes: Record<string, string>
}

export const YoutubeEmbed = Node.create<YoutubeEmbedOptions>({
  name: 'youtubeEmbed',
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
      videoId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-video-id') || '',
        renderHTML: (attributes) => ({ 'data-video-id': String(attributes.videoId || '') }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) =>
          attributes.title ? { 'data-title': String(attributes.title) } : {},
      },
      thumbnailUrl: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-thumbnail-url'),
        renderHTML: (attributes) =>
          attributes.thumbnailUrl ? { 'data-thumbnail-url': String(attributes.thumbnailUrl) } : {},
      },
      size: {
        default: 'md',
        parseHTML: (element) => element.getAttribute('data-size') || 'md',
        renderHTML: (attributes) => ({ 'data-size': String(attributes.size || 'md') }),
      },
      position: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-position') || 'center',
        renderHTML: (attributes) => ({
          'data-position': String(attributes.position || 'center'),
        }),
      },
      aspectRatio: {
        default: '16/9',
        parseHTML: (element) => element.getAttribute('data-aspect-ratio') || '16/9',
        renderHTML: (attributes) => ({
          'data-aspect-ratio': String(attributes.aspectRatio || '16/9'),
        }),
      },
      startAt: {
        default: 0,
        parseHTML: (element) =>
          Number.parseInt(element.getAttribute('data-start-at') || '0', 10) || 0,
        renderHTML: (attributes) => ({ 'data-start-at': String(attributes.startAt || 0) }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-youtube-embed]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-youtube-embed': 'true',
        'class': 'youtube-embed-node',
        ...HTMLAttributes,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeNodeView)
  },
})

export default YoutubeEmbed
