import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import AlertBlockNodeView from '../components/alert/alert-node-view'

export interface AlertBlockOptions {
  HTMLAttributes: Record<string, string>
}

export const AlertBlock = Node.create<AlertBlockOptions>({
  name: 'alertBlock',
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
      alertType: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-alert-type') || 'info',
        renderHTML: (attributes) => ({
          'data-alert-type': String(attributes.alertType || 'info'),
        }),
      },
      title: {
        default: 'Info',
        parseHTML: (element) => element.getAttribute('data-title') || 'Info',
        renderHTML: (attributes) => ({ 'data-title': String(attributes.title || 'Info') }),
      },
      message: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-message') || '',
        renderHTML: (attributes) => ({ 'data-message': String(attributes.message || '') }),
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
    return [{ tag: 'div[data-alert-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-alert-block': 'true',
        'class': 'alert-block-node',
        ...HTMLAttributes,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AlertBlockNodeView)
  },
})

export default AlertBlock
