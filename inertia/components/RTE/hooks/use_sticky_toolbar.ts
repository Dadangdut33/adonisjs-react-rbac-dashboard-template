import { type RefObject, useEffect, useState } from 'react'

export default function useStickyToolbar({
  stickyToolbar,
  readOnly,
  toolbarRef,
  editorContainerRef,
  editorContentRef,
}: {
  stickyToolbar: boolean
  readOnly: boolean
  toolbarRef: RefObject<HTMLDivElement | null>
  editorContainerRef: RefObject<HTMLDivElement | null>
  editorContentRef: RefObject<HTMLDivElement | null>
}) {
  const [isToolbarSticky, setIsToolbarSticky] = useState(false)

  useEffect(() => {
    if (!stickyToolbar || readOnly) return

    const handleScroll = () => {
      if (!toolbarRef.current || !editorContainerRef.current) return

      const editorRect = editorContainerRef.current.getBoundingClientRect()
      const toolbarHeight = toolbarRef.current.offsetHeight

      if (editorRect.top < 0) {
        if (!isToolbarSticky) {
          setIsToolbarSticky(true)
          if (editorContentRef.current) {
            editorContentRef.current.style.paddingTop = `${toolbarHeight}px`
          }
        }
      } else if (isToolbarSticky) {
        setIsToolbarSticky(false)
        if (editorContentRef.current) {
          editorContentRef.current.style.paddingTop = '0'
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [stickyToolbar, readOnly, isToolbarSticky])

  return { isToolbarSticky }
}
