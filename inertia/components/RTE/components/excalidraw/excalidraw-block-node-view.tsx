import type {
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types'
import { useComputedColorScheme } from '@mantine/core'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Loader2, Minus, PencilRuler, Plus } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

type CardSize = 'sm' | 'md' | 'lg'
type DisplayMode = 'canvas' | 'image'
type Position = 'left' | 'center' | 'right'

type ExcalidrawAttrs = {
  sceneData?: string | null
  cardSize?: CardSize
  displayMode?: DisplayMode
  autoScaleOnNarrow?: boolean
  position?: Position
  height?: number
}

type ExcalidrawOnChange = NonNullable<ExcalidrawProps['onChange']>
type ExcalidrawTheme = NonNullable<ExcalidrawProps['theme']>
type ExcalidrawZoom = NonNullable<NonNullable<ExcalidrawInitialDataState['appState']>['zoom']>
const ExcalidrawCanvas = lazy(async () => {
  await import('@excalidraw/excalidraw/index.css')
  const mod = await import('@excalidraw/excalidraw')
  return { default: mod.Excalidraw }
})

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const TRANSPARENT_CANVAS = 'rgba(0, 0, 0, 0)'
const EXCALIDRAW_FIT_PADDING = 48
const IMAGE_MODE_PAN_SLACK = 40
const EXCALIDRAW_READ_ZOOM_STEP = 0.15
const toNormalizedZoom = (value: number) => ({
  value: Math.max(0.1, Math.min(5, value)) as ExcalidrawZoom['value'],
})

const getSceneBounds = (elements: readonly unknown[]) => {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const element of elements) {
    if (!element || typeof element !== 'object') continue

    const shape = element as Record<string, unknown>
    if (shape.isDeleted === true) continue

    const x = typeof shape.x === 'number' ? shape.x : null
    const y = typeof shape.y === 'number' ? shape.y : null
    const width = typeof shape.width === 'number' ? shape.width : null
    const height = typeof shape.height === 'number' ? shape.height : null

    if (x === null || y === null || width === null || height === null) continue

    const x2 = x + width
    const y2 = y + height

    minX = Math.min(minX, x, x2)
    minY = Math.min(minY, y, y2)
    maxX = Math.max(maxX, x, x2)
    maxY = Math.max(maxY, y, y2)
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return null
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

const normalizeAppState = (rawAppState: unknown): ExcalidrawInitialDataState['appState'] => {
  if (!rawAppState || typeof rawAppState !== 'object') return {}

  const appState = { ...(rawAppState as Record<string, unknown>) }

  // Excalidraw expects these as Map/Set. Old serialized JSON may contain plain objects.
  if ('collaborators' in appState && !(appState.collaborators instanceof Map)) {
    appState.collaborators = new Map()
  }
  if ('followedBy' in appState && !(appState.followedBy instanceof Set)) {
    appState.followedBy = new Set()
  }

  return appState as ExcalidrawInitialDataState['appState']
}

const parseSceneData = (raw: string | null | undefined): ExcalidrawInitialDataState => {
  if (!raw) return { elements: [], appState: {}, files: {} as BinaryFiles }

  try {
    const parsed = JSON.parse(raw) as Partial<ExcalidrawInitialDataState>
    return {
      elements: Array.isArray(parsed?.elements) ? parsed.elements : [],
      appState: normalizeAppState(parsed?.appState),
      files:
        typeof parsed?.files === 'object' && parsed?.files
          ? (parsed.files as BinaryFiles)
          : ({} as BinaryFiles),
    }
  } catch {
    return { elements: [], appState: {}, files: {} as BinaryFiles }
  }
}

const extractPersistedAppState = (
  appState: Parameters<ExcalidrawOnChange>[1]
): ExcalidrawInitialDataState['appState'] => {
  return {
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
    zoom: appState.zoom,
    viewBackgroundColor: appState.viewBackgroundColor,
    theme: appState.theme,
    gridSize: appState.gridSize,
    gridStep: appState.gridStep,
  }
}

const serializeSceneData = (
  elements: Parameters<ExcalidrawOnChange>[0],
  appState: Parameters<ExcalidrawOnChange>[1],
  files: Parameters<ExcalidrawOnChange>[2]
) =>
  JSON.stringify({
    elements,
    appState: extractPersistedAppState(appState),
    files,
  })

export default function ExcalidrawBlockNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const attrs = node.attrs as ExcalidrawAttrs
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: false })
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditingCanvas, setIsEditingCanvas] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [isCanvasFocused, setIsCanvasFocused] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [heightInput, setHeightInput] = useState(String(attrs.height ?? 460))
  const [readZoomPercent, setReadZoomPercent] = useState<number | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const lastSavedSceneRef = useRef(attrs.sceneData || '')
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const interactionShellRef = useRef<HTMLDivElement | null>(null)
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const isClampingPanRef = useRef(false)
  const panStateRef = useRef<{
    pointerId: number
    startClientX: number
    startClientY: number
    startScrollX: number
    startScrollY: number
    active: boolean
  } | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const syncPointerType = () => setIsCoarsePointer(mediaQuery.matches)

    syncPointerType()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPointerType)
      return () => mediaQuery.removeEventListener('change', syncPointerType)
    }

    mediaQuery.addListener(syncPointerType)
    return () => mediaQuery.removeListener(syncPointerType)
  }, [])

  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return

    const updateWidth = () => setContainerWidth(container.clientWidth)
    updateWidth()

    const frameId = window.requestAnimationFrame(updateWidth)

    const observer = new ResizeObserver(() => updateWidth())
    observer.observe(container)

    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const syncEditable = () => {
      const editable = !!editor?.isEditable
      setIsEditable(editable)
      if (!editable) setIsEditingCanvas(false)
    }

    syncEditable()
    editor.on('transaction', syncEditable)
    editor.on('selectionUpdate', syncEditable)
    editor.on('focus', syncEditable)
    editor.on('blur', syncEditable)

    return () => {
      editor.off('transaction', syncEditable)
      editor.off('selectionUpdate', syncEditable)
      editor.off('focus', syncEditable)
      editor.off('blur', syncEditable)
    }
  }, [editor])

  useEffect(() => {
    setHeightInput(String(attrs.height ?? 460))
  }, [attrs.height])

  useEffect(() => {
    lastSavedSceneRef.current = attrs.sceneData || ''
  }, [attrs.sceneData])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const excalidrawTheme: ExcalidrawTheme = colorScheme === 'dark' ? 'dark' : 'light'
  const cardSize = attrs.cardSize || 'lg'
  const displayMode = attrs.displayMode || 'canvas'
  const autoScaleOnNarrow = !!attrs.autoScaleOnNarrow
  const position = attrs.position || 'center'
  const height = clamp(Number(attrs.height) || 460, 280, 900)
  const canEditCanvas = isEditable && isEditingCanvas
  const canPanInReadMode = !canEditCanvas
  const excalidrawViewModeEnabled = !canEditCanvas
  const getEffectiveContainerWidth = () =>
    containerWidth || canvasContainerRef.current?.clientWidth || 0
  const scene = useMemo(() => {
    const parsedScene = parseSceneData(attrs.sceneData)
    const parsedAppState = parsedScene.appState ?? {}
    const effectiveContainerWidth = getEffectiveContainerWidth()
    const savedZoomValue =
      parsedAppState.zoom && typeof parsedAppState.zoom.value === 'number'
        ? parsedAppState.zoom.value
        : 1
    const bounds = getSceneBounds(parsedScene.elements || [])
    const shouldAutoScale =
      !canEditCanvas &&
      autoScaleOnNarrow &&
      !!bounds &&
      bounds.width > 0 &&
      effectiveContainerWidth > 0

    let nextZoom = parsedAppState.zoom
    let nextScrollX = parsedAppState.scrollX
    let nextScrollY = parsedAppState.scrollY

    if (shouldAutoScale && bounds) {
      const availableWidth = Math.max(effectiveContainerWidth - EXCALIDRAW_FIT_PADDING * 2, 120)
      const fitZoomValue = Math.min(1, availableWidth / bounds.width)
      const finalZoomValue = Math.min(savedZoomValue, fitZoomValue)
      nextZoom = toNormalizedZoom(finalZoomValue)
      nextScrollX = effectiveContainerWidth / 2 - bounds.centerX * finalZoomValue
      nextScrollY = height / 2 - bounds.centerY * finalZoomValue
    }

    return {
      ...parsedScene,
      appState: {
        ...parsedAppState,
        zoom: nextZoom,
        scrollX: nextScrollX,
        scrollY: nextScrollY,
        theme: excalidrawTheme,
        viewBackgroundColor:
          displayMode === 'image' ? TRANSPARENT_CANVAS : parsedAppState.viewBackgroundColor,
      },
    }
  }, [
    attrs.sceneData,
    attrs.displayMode,
    attrs.autoScaleOnNarrow,
    excalidrawTheme,
    canEditCanvas,
    containerWidth,
    height,
  ])
  const hasElements = (scene.elements?.length || 0) > 0
  const sceneBounds = useMemo(() => getSceneBounds(scene.elements || []), [scene.elements])
  const renderedHeight = useMemo(() => {
    if (canEditCanvas || !autoScaleOnNarrow || !sceneBounds) return height

    const effectiveZoom = scene.appState?.zoom?.value ?? 1
    const fittedHeight = Math.ceil(sceneBounds.height * effectiveZoom + EXCALIDRAW_FIT_PADDING * 2)

    return clamp(fittedHeight, 220, height)
  }, [autoScaleOnNarrow, canEditCanvas, height, scene.appState?.zoom?.value, sceneBounds])

  const widthClass =
    cardSize === 'sm'
      ? 'w-[24rem] max-w-full'
      : cardSize === 'md'
        ? 'w-[40rem] max-w-full'
        : 'w-full'
  const positionClass =
    position === 'left' ? 'mr-auto' : position === 'right' ? 'ml-auto' : 'mx-auto'
  const shellClass =
    displayMode === 'image'
      ? cn(
          'overflow-visible border-transparent bg-transparent p-0 shadow-none',
          widthClass,
          positionClass
        )
      : cn('gap-0 overflow-hidden py-4', widthClass, positionClass)
  const canvasFrameClass =
    displayMode === 'image'
      ? 'overflow-hidden rounded-none border-0 bg-transparent'
      : 'overflow-hidden rounded-base border-2 border-border'
  const canvasBackgroundClass = displayMode === 'image' ? 'bg-transparent' : 'bg-background'

  const persistScene: ExcalidrawOnChange = (elements, appState, files) => {
    if (!isEditable) return

    const nextScene = serializeSceneData(elements, appState, files)
    if (nextScene === lastSavedSceneRef.current) return

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = window.setTimeout(() => {
      updateAttributes({ sceneData: nextScene })
      lastSavedSceneRef.current = nextScene
    }, 300)
  }

  const updateLayoutField = (
    key: 'cardSize' | 'displayMode' | 'position' | 'autoScaleOnNarrow',
    value: CardSize | DisplayMode | Position | boolean
  ) => {
    if (!isEditable) return
    updateAttributes({ [key]: value })
  }

  const saveHeight = () => {
    if (!isEditable) return
    const parsed = clamp(Number.parseInt(heightInput, 10) || 460, 280, 900)
    updateAttributes({ height: parsed })
    setHeightInput(String(parsed))
  }

  const shouldClampImagePan = !canEditCanvas && displayMode === 'image' && !!sceneBounds
  const getClampedViewport = (scrollX: number, scrollY: number, zoomValue: number) => {
    if (!shouldClampImagePan || !sceneBounds) {
      return { scrollX, scrollY }
    }

    const effectiveContainerWidth = getEffectiveContainerWidth()
    const effectiveHeight = renderedHeight
    const centeredScrollX = effectiveContainerWidth / 2 - sceneBounds.centerX * zoomValue
    const centeredScrollY = effectiveHeight / 2 - sceneBounds.centerY * zoomValue
    const horizontalOverflow = Math.max(0, sceneBounds.width * zoomValue - effectiveContainerWidth)
    const verticalOverflow = Math.max(0, sceneBounds.height * zoomValue - effectiveHeight)

    return {
      scrollX: clamp(
        scrollX,
        centeredScrollX - horizontalOverflow / 2 - IMAGE_MODE_PAN_SLACK,
        centeredScrollX + horizontalOverflow / 2 + IMAGE_MODE_PAN_SLACK
      ),
      scrollY: clamp(
        scrollY,
        centeredScrollY - verticalOverflow / 2 - IMAGE_MODE_PAN_SLACK,
        centeredScrollY + verticalOverflow / 2 + IMAGE_MODE_PAN_SLACK
      ),
    }
  }

  useEffect(() => {
    const api = excalidrawApiRef.current
    if (!api || !shouldClampImagePan || !sceneBounds) return

    const unsubscribe = api.onScrollChange((scrollX, scrollY, zoom) => {
      if (isClampingPanRef.current) return

      const zoomValue = typeof zoom?.value === 'number' ? zoom.value : 1
      const nextViewport = getClampedViewport(scrollX, scrollY, zoomValue)
      const nextScrollX = nextViewport.scrollX
      const nextScrollY = nextViewport.scrollY

      if (nextScrollX === scrollX && nextScrollY === scrollY) return

      isClampingPanRef.current = true
      api.updateScene({
        appState: {
          scrollX: nextScrollX,
          scrollY: nextScrollY,
        },
      })
      window.requestAnimationFrame(() => {
        isClampingPanRef.current = false
      })
    })

    return () => unsubscribe()
  }, [containerWidth, renderedHeight, sceneBounds, shouldClampImagePan])

  useEffect(() => {
    const api = excalidrawApiRef.current
    if (!api || canEditCanvas) return

    const baseZoom = scene.appState?.zoom ?? toNormalizedZoom(1)
    const baseTheme = scene.appState?.theme ?? excalidrawTheme
    const baseBackground =
      scene.appState?.viewBackgroundColor ??
      (displayMode === 'image' ? TRANSPARENT_CANVAS : '#ffffff')
    const nextViewport = getClampedViewport(
      scene.appState?.scrollX ?? 0,
      scene.appState?.scrollY ?? 0,
      baseZoom.value
    )

    api.updateScene({
      appState: {
        zoom: baseZoom,
        scrollX: nextViewport.scrollX,
        scrollY: nextViewport.scrollY,
        theme: baseTheme,
        viewBackgroundColor: baseBackground,
      },
    })
    syncReadZoomPercent()
  }, [
    canEditCanvas,
    displayMode,
    excalidrawTheme,
    scene.appState?.scrollX,
    scene.appState?.scrollY,
    scene.appState?.zoom,
    scene.appState?.theme,
    scene.appState?.viewBackgroundColor,
    renderedHeight,
    shouldClampImagePan,
  ])

  useEffect(() => {
    if (canPanInReadMode) return
    panStateRef.current = null
  }, [canPanInReadMode])

  useEffect(() => {
    const api = excalidrawApiRef.current
    if (!api || canEditCanvas) return

    syncReadZoomPercent()
    const unsubscribe = api.onScrollChange((_scrollX, _scrollY, zoom) => {
      setReadZoomPercent(Math.round((zoom?.value ?? 1) * 100))
    })

    return () => unsubscribe()
  }, [canEditCanvas])

  const handleWheelCapture: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (canEditCanvas || isCoarsePointer) return

    event.preventDefault()
    event.stopPropagation()

    window.scrollBy({
      top: event.deltaY,
      left: event.deltaX,
      behavior: 'auto',
    })
  }

  const showFocusedReadUi = !canEditCanvas && displayMode === 'image'
  const syncReadZoomPercent = () => {
    const zoomValue = excalidrawApiRef.current?.getAppState().zoom?.value
    setReadZoomPercent(typeof zoomValue === 'number' ? Math.round(zoomValue * 100) : null)
  }

  const resetReadViewport = () => {
    const api = excalidrawApiRef.current
    if (!api) return

    const baseZoom = scene.appState?.zoom ?? toNormalizedZoom(1)
    const baseTheme = scene.appState?.theme ?? excalidrawTheme
    const baseBackground =
      scene.appState?.viewBackgroundColor ??
      (displayMode === 'image' ? TRANSPARENT_CANVAS : '#ffffff')
    const nextViewport = getClampedViewport(
      scene.appState?.scrollX ?? 0,
      scene.appState?.scrollY ?? 0,
      baseZoom.value
    )

    api.updateScene({
      appState: {
        zoom: baseZoom,
        scrollX: nextViewport.scrollX,
        scrollY: nextViewport.scrollY,
        theme: baseTheme,
        viewBackgroundColor: baseBackground,
      },
    })
    syncReadZoomPercent()
  }

  const adjustReadZoom = (direction: 'in' | 'out') => {
    const api = excalidrawApiRef.current
    if (!api) return

    const appState = api.getAppState()
    const currentZoomValue = appState.zoom.value
    const nextZoom = toNormalizedZoom(
      direction === 'in'
        ? currentZoomValue + EXCALIDRAW_READ_ZOOM_STEP
        : currentZoomValue - EXCALIDRAW_READ_ZOOM_STEP
    )
    const effectiveContainerWidth = getEffectiveContainerWidth()
    const centerWorldX = (effectiveContainerWidth / 2 - appState.scrollX) / currentZoomValue
    const centerWorldY = (renderedHeight / 2 - appState.scrollY) / currentZoomValue
    const unclampedScrollX = effectiveContainerWidth / 2 - centerWorldX * nextZoom.value
    const unclampedScrollY = renderedHeight / 2 - centerWorldY * nextZoom.value
    const nextViewport = getClampedViewport(unclampedScrollX, unclampedScrollY, nextZoom.value)

    api.updateScene({
      appState: {
        zoom: nextZoom,
        scrollX: nextViewport.scrollX,
        scrollY: nextViewport.scrollY,
      },
    })
    syncReadZoomPercent()
  }

  const canStartViewportPan = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return true

    return !target.closest(
      '.rte-excalidraw-read-controls, .App-menu_top, .App-menu_bottom, .App-bottom-bar, .App-mobile-menu, .App-toolbar, .layer-ui__wrapper__top-right, .sidebar-trigger, .help-icon, .mobile-misc-tools-container, .Island, .ToolIcon, .ToolIcon__icon, button, [role=\"button\"], input, select, textarea'
    )
  }

  const handlePointerDownCapture: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!canPanInReadMode || !canStartViewportPan(event.target)) return

    const api = excalidrawApiRef.current
    const shell = interactionShellRef.current
    if (!api || !shell) return

    const appState = api.getAppState()
    panStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startScrollX: appState.scrollX,
      startScrollY: appState.scrollY,
      active: true,
    }

    shell.setPointerCapture(event.pointerId)
    shell.focus()

    if (showFocusedReadUi) {
      setIsCanvasFocused(true)
    }
  }

  const handlePointerMoveCapture: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const panState = panStateRef.current
    const api = excalidrawApiRef.current
    if (!panState || !api || panState.pointerId !== event.pointerId || !panState.active) return

    const deltaX = event.clientX - panState.startClientX
    const deltaY = event.clientY - panState.startClientY
    const appState = api.getAppState()
    const nextViewport = getClampedViewport(
      panState.startScrollX + deltaX,
      panState.startScrollY + deltaY,
      appState.zoom?.value ?? 1
    )

    api.updateScene({
      appState: {
        scrollX: nextViewport.scrollX,
        scrollY: nextViewport.scrollY,
      },
    })
  }

  const handlePointerUpCapture: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const panState = panStateRef.current
    const shell = interactionShellRef.current
    if (!panState || panState.pointerId !== event.pointerId) return

    if (shell?.hasPointerCapture(event.pointerId)) {
      shell.releasePointerCapture(event.pointerId)
    }

    panStateRef.current = null
  }

  return (
    <NodeViewWrapper className="not-prose my-3">
      {isEditable ? (
        <div className={cn('mb-2 flex flex-wrap items-center gap-2', widthClass, positionClass)}>
          <Button
            size="sm"
            variant={isEditingCanvas ? 'default' : 'outline'}
            type="button"
            onClick={() => setIsEditingCanvas((prev) => !prev)}
          >
            <PencilRuler className="h-4 w-4" />
            {isEditingCanvas ? 'Editing' : 'Preview'}
          </Button>

          <select
            value={cardSize}
            onChange={(e) => updateLayoutField('cardSize', e.target.value as CardSize)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>

          <select
            value={displayMode}
            onChange={(e) => updateLayoutField('displayMode', e.target.value as DisplayMode)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="canvas">Canvas</option>
            <option value="image">Image-like</option>
          </select>

          <select
            value={position}
            onChange={(e) => updateLayoutField('position', e.target.value as Position)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>

          <select
            value={autoScaleOnNarrow ? 'auto-scale' : 'overflow'}
            onChange={(e) =>
              updateLayoutField('autoScaleOnNarrow', e.target.value === 'auto-scale')
            }
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="overflow">Allow Overflow</option>
            <option value="auto-scale">Auto Scale</option>
          </select>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={280}
              max={900}
              className="h-9 w-28"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              onBlur={saveHeight}
            />
            <span className="text-xs text-muted-foreground">height</span>
          </div>
        </div>
      ) : null}

      <Card
        className={cn(shellClass, displayMode === 'image' && 'border-0 rounded-none !shadow-none')}
      >
        <CardContent className={displayMode === 'image' ? 'p-0' : 'px-4'}>
          <div ref={canvasContainerRef} className={canvasFrameClass}>
            <div
              ref={interactionShellRef}
              tabIndex={showFocusedReadUi ? 0 : undefined}
              data-excalidraw-read-image={showFocusedReadUi ? 'true' : undefined}
              data-focused={showFocusedReadUi && isCanvasFocused ? 'true' : 'false'}
              className={cn(
                'relative',
                canvasBackgroundClass,
                !canEditCanvas && 'rte-excalidraw-read-shell',
                showFocusedReadUi && 'rte-excalidraw-read-image-shell outline-none',
                canPanInReadMode && 'cursor-grab active:cursor-grabbing'
              )}
              style={{
                height: renderedHeight,
                touchAction: !canEditCanvas && isCoarsePointer ? 'pan-x pan-y' : undefined,
              }}
              onPointerDownCapture={handlePointerDownCapture}
              onPointerMoveCapture={handlePointerMoveCapture}
              onPointerUpCapture={handlePointerUpCapture}
              onPointerCancelCapture={handlePointerUpCapture}
              onFocusCapture={() => {
                if (showFocusedReadUi) setIsCanvasFocused(true)
              }}
              onBlurCapture={(event) => {
                if (
                  showFocusedReadUi &&
                  !event.currentTarget.contains(event.relatedTarget as Node | null)
                ) {
                  setIsCanvasFocused(false)
                }
              }}
              onWheelCapture={handleWheelCapture}
            >
              {isClient ? (
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading Excalidraw...
                    </div>
                  }
                >
                  <ExcalidrawCanvas
                    excalidrawAPI={(api) => {
                      excalidrawApiRef.current = api
                      setContainerWidth(canvasContainerRef.current?.clientWidth || 0)
                      syncReadZoomPercent()
                    }}
                    initialData={scene}
                    theme={excalidrawTheme}
                    viewModeEnabled={excalidrawViewModeEnabled}
                    zenModeEnabled={!canEditCanvas && displayMode !== 'image'}
                    onChange={persistScene}
                    UIOptions={{
                      canvasActions: {
                        changeViewBackgroundColor: canEditCanvas,
                        clearCanvas: canEditCanvas,
                        loadScene: canEditCanvas,
                        saveToActiveFile: false,
                        toggleTheme: false,
                      },
                    }}
                  />
                </Suspense>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Excalidraw preview is available after page load.
                </div>
              )}
              {!canEditCanvas ? (
                <div className="rte-excalidraw-read-controls pointer-events-none absolute right-2 bottom-2 z-30 hidden items-center gap-2 max-[1085px]:flex">
                  <div className="pointer-events-auto flex items-center gap-1 rounded-base border-2 border-border bg-background/95 px-1 py-0.5 shadow-shadow backdrop-blur">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustReadZoom('out')}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 min-w-12 px-1.5 text-[11px] font-medium"
                      onClick={resetReadViewport}
                    >
                      {readZoomPercent ? `${readZoomPercent}%` : 'Reset'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustReadZoom('in')}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditable ? (
        <p className={cn('mt-1 text-xs text-muted-foreground', widthClass, positionClass)}>
          {hasElements
            ? `Excalidraw block${displayMode === 'image' ? ' · image-like' : ''}${autoScaleOnNarrow ? ' · auto-scale' : ''}`
            : `Excalidraw block (empty)${displayMode === 'image' ? ' · image-like' : ''}${autoScaleOnNarrow ? ' · auto-scale' : ''}`}
        </p>
      ) : null}
    </NodeViewWrapper>
  )
}
