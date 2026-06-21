import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import { NodeSelection, Plugin, PluginKey } from 'prosemirror-state'

export interface ResizableImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
  onSelect?: (attrs: { pos: number; src: string; width: number; height: number }) => void
  onDeselect?: () => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: number
        height?: number
        align?: string
      }) => ReturnType
      updateImageSize: (options: { width?: number; height?: number }) => ReturnType
      updateImageAlign: (options: { align: 'left' | 'center' | 'right' }) => ReturnType
    }
  }
}

const inputRegex = /(?:^|\s)(!\[(.+|:?)]$$(\S+)(?:(?:\s+)["'](\S+)["'])?$$)$/

const getIntOrDefault = (value: unknown, fallback: number) => {
  if (value === null || value === undefined || value === '') return fallback
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const findImageNodeAtCandidates = (doc: any, candidates: number[]) => {
  for (const candidate of candidates) {
    if (candidate < 0) continue
    const node = doc.nodeAt(candidate)
    if (node?.type?.name === 'image') {
      return { pos: candidate, node }
    }
  }

  return null
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      onSelect: undefined,
      onDeselect: undefined,
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          if (!attributes.align) return {}
          return { 'data-align': attributes.align }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          const img = element as HTMLImageElement
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            align: img.getAttribute('data-align') || 'center',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { width, height, align, ...restAttributes } = HTMLAttributes
    const attrs = { ...restAttributes } as Record<string, any>

    if (width) attrs.width = width
    if (height) attrs.height = height
    if (align) attrs['data-align'] = align

    return ['img', mergeAttributes(this.options.HTMLAttributes, attrs)]
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              align: 'center',
              ...options,
            },
          })
        },

      updateImageSize:
        (options) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          if (!(selection instanceof NodeSelection) || selection.node.type !== this.type) {
            return false
          }

          if (dispatch) {
            tr.setNodeMarkup(selection.from, undefined, {
              ...selection.node.attrs,
              ...options,
            })
            dispatch(tr)
          }

          return true
        },

      updateImageAlign:
        (options) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          if (!(selection instanceof NodeSelection) || selection.node.type !== this.type) {
            return false
          }

          if (dispatch) {
            tr.setNodeMarkup(selection.from, undefined, {
              ...selection.node.attrs,
              align: options.align,
            })
            dispatch(tr)
          }

          return true
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match
          return { src, alt, title, align: 'center' }
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    const { onSelect, onDeselect } = this.options

    return [
      new Plugin({
        key: new PluginKey('resizableImageSelect'),
        props: {
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement | null

            const imageEl = target?.closest('img')
            if (imageEl) {
              const domPos = view.posAtDOM(imageEl, 0)
              const found = findImageNodeAtCandidates(view.state.doc, [
                pos,
                pos - 1,
                pos + 1,
                domPos,
                domPos - 1,
                domPos + 1,
              ])

              if (found) {
                const tr = view.state.tr.setSelection(
                  NodeSelection.create(view.state.doc, found.pos)
                )
                view.dispatch(tr)

                onSelect?.({
                  pos: found.pos,
                  src: String(found.node.attrs.src || ''),
                  width: getIntOrDefault(found.node.attrs.width, 300),
                  height: getIntOrDefault(found.node.attrs.height, 200),
                })

                return true
              }
            }

            const isResizeControl =
              !!target?.closest('[role="slider"]') || !!target?.closest('[data-resize-control]')

            if (!isResizeControl) {
              onDeselect?.()
            }

            return false
          },
        },
      }),
    ]
  },
})

export default ResizableImage
