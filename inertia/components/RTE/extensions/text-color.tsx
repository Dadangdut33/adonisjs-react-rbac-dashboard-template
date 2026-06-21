import { Mark, mergeAttributes } from '@tiptap/core'

const TextColor = Mark.create({
  name: 'textColor',
  priority: 1000,
  inclusive: true,
  excludes: '',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color || element.getAttribute('data-color'),
        renderHTML: (attributes: { color?: string | null }) => {
          if (!attributes.color) return {}
          return {
            style: `color: ${attributes.color}`,
            'data-color': attributes.color,
          }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[style*=color]' }, { tag: 'span[data-color]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },
})

export default TextColor

