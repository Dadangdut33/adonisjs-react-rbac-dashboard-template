import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import LinkCardNodeView from '../components/link/linkCard-node-view'

export interface LinkCardOptions {
  HTMLAttributes: Record<string, string>
}

export const LinkCard = Node.create<LinkCardOptions>({
  name: 'linkCard',
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
        renderHTML: (attributes) => ({ 'data-url': attributes.url }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) =>
          attributes.title ? { 'data-title': String(attributes.title) } : {},
      },
      description: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-description'),
        renderHTML: (attributes) =>
          attributes.description ? { 'data-description': String(attributes.description) } : {},
      },
      imageUrl: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-image-url'),
        renderHTML: (attributes) =>
          attributes.imageUrl ? { 'data-image-url': String(attributes.imageUrl) } : {},
      },
      siteName: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-site-name'),
        renderHTML: (attributes) =>
          attributes.siteName ? { 'data-site-name': String(attributes.siteName) } : {},
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
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-link-card]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-link-card': 'true',
        'class': 'link-card-node',
        ...HTMLAttributes,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardNodeView)
  },
})

export default LinkCard
