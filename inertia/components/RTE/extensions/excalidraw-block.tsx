import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import ExcalidrawBlockNodeView from '../components/excalidraw/excalidraw-block-node-view'

export interface ExcalidrawBlockOptions {
  HTMLAttributes: Record<string, string>
}

export const ExcalidrawBlock = Node.create<ExcalidrawBlockOptions>({
  name: 'excalidrawBlock',
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
      sceneData: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-scene-data') || null,
        renderHTML: (attributes) =>
          attributes.sceneData ? { 'data-scene-data': String(attributes.sceneData) } : {},
      },
      cardSize: {
        default: 'lg',
        parseHTML: (element) => element.getAttribute('data-card-size') || 'lg',
        renderHTML: (attributes) => ({ 'data-card-size': String(attributes.cardSize || 'lg') }),
      },
      displayMode: {
        default: 'canvas',
        parseHTML: (element) => element.getAttribute('data-display-mode') || 'canvas',
        renderHTML: (attributes) => ({
          'data-display-mode': String(attributes.displayMode || 'canvas'),
        }),
      },
      autoScaleOnNarrow: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-auto-scale-on-narrow') === 'true',
        renderHTML: (attributes) => ({
          'data-auto-scale-on-narrow': String(Boolean(attributes.autoScaleOnNarrow)),
        }),
      },
      position: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-position') || 'center',
        renderHTML: (attributes) => ({ 'data-position': String(attributes.position || 'center') }),
      },
      height: {
        default: 460,
        parseHTML: (element) => Number.parseInt(element.getAttribute('data-height') || '460', 10),
        renderHTML: (attributes) => ({ 'data-height': String(attributes.height || 460) }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-excalidraw-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-excalidraw-block': 'true',
        class: 'excalidraw-block-node',
        ...HTMLAttributes,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawBlockNodeView)
  },
})

export default ExcalidrawBlock
