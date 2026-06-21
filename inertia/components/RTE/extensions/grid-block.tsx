import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import GridBlockNodeView from '../components/grid/grid-block-node-view'

export interface GridBlockOptions {
  HTMLAttributes: Record<string, string>
}

export const GridBlock = Node.create<GridBlockOptions>({
  name: 'gridBlock',
  group: 'block',
  atom: false,
  isolating: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      columns: {
        default: 3,
        parseHTML: (element) =>
          Number.parseInt(element.getAttribute('data-columns') || '3', 10) || 3,
        renderHTML: (attributes) => ({ 'data-columns': String(attributes.columns || 3) }),
      },
      itemCount: {
        default: 6,
        parseHTML: (element) =>
          Number.parseInt(element.getAttribute('data-item-count') || '6', 10) || 6,
        renderHTML: (attributes) => ({ 'data-item-count': String(attributes.itemCount || 6) }),
      },
      itemMinWidth: {
        default: 220,
        parseHTML: (element) =>
          Number.parseInt(element.getAttribute('data-item-min-width') || '220', 10) || 220,
        renderHTML: (attributes) => ({
          'data-item-min-width': String(attributes.itemMinWidth || 220),
        }),
      },
      gap: {
        default: 12,
        parseHTML: (element) => Number.parseInt(element.getAttribute('data-gap') || '12', 10) || 12,
        renderHTML: (attributes) => ({ 'data-gap': String(attributes.gap || 12) }),
      },
      mobileBehavior: {
        default: 'scroll',
        parseHTML: (element) => element.getAttribute('data-mobile-behavior') || 'scroll',
        renderHTML: (attributes) => ({
          'data-mobile-behavior': String(attributes.mobileBehavior || 'scroll'),
        }),
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
      itemContents: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute('data-item-contents')
          if (!raw) return []

          try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed.map((value) => String(value ?? '')) : []
          } catch {
            return []
          }
        },
        renderHTML: (attributes) => ({
          'data-item-contents': JSON.stringify(
            Array.isArray(attributes.itemContents) ? attributes.itemContents : []
          ),
        }),
      },
      itemData: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute('data-item-data')
          if (!raw) return []

          try {
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []

            return parsed.map((value) => ({
              icon: String(value?.icon ?? ''),
              title: String(value?.title ?? ''),
              description: String(value?.description ?? ''),
              titleFormat: {
                bold: !!value?.titleFormat?.bold,
                italic: !!value?.titleFormat?.italic,
                underline: !!value?.titleFormat?.underline,
              },
              descriptionFormat: {
                bold: !!value?.descriptionFormat?.bold,
                italic: !!value?.descriptionFormat?.italic,
                underline: !!value?.descriptionFormat?.underline,
              },
            }))
          } catch {
            return []
          }
        },
        renderHTML: (attributes) => ({
          'data-item-data': JSON.stringify(
            Array.isArray(attributes.itemData) ? attributes.itemData : []
          ),
        }),
      },
      gridStyle: {
        default: 'card',
        parseHTML: (element) =>
          element.getAttribute('data-grid-style') ||
          element.getAttribute('data-item-style') ||
          'card',
        renderHTML: (attributes) => ({ 'data-grid-style': String(attributes.gridStyle || 'card') }),
      },
      textColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-text-color') || null,
        renderHTML: (attributes) => ({
          'data-text-color': attributes.textColor ? String(attributes.textColor) : null,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-grid-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-grid-block': 'true',
        'class': 'grid-block-node',
        ...HTMLAttributes,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GridBlockNodeView)
  },
})

export default GridBlock
