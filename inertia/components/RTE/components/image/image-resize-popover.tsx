import { Editor } from '@tiptap/react'
import { ImageDown, Lock, Maximize, Minimize, Unlock } from 'lucide-react'
import type { MouseEvent, MutableRefObject } from 'react'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Slider } from '~/components/ui/slider'
import { Switch } from '~/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { SelectedImageType } from '../../types'

export default function ImageResizePopover({
  editor,
  selectedImage,
  maintainAspectRatio,
  resizePopoverOpen,
  setResizePopoverOpen,
  isResizingRef,
  onWidthChange,
  onHeightChange,
  onSliderMouseDown,
  onSliderMouseUp,
  onMaximize,
  onReset,
  onToggleAspectRatio,
}: {
  editor: Editor | null
  selectedImage: SelectedImageType
  maintainAspectRatio: boolean
  resizePopoverOpen: boolean
  setResizePopoverOpen: (open: boolean) => void
  isResizingRef: MutableRefObject<boolean>
  onWidthChange: (value: number[]) => void
  onHeightChange: (value: number[]) => void
  onSliderMouseDown: (event: MouseEvent) => void
  onSliderMouseUp: () => void
  onMaximize: () => void
  onReset: () => void
  onToggleAspectRatio: () => void
}) {
  if (!editor || !selectedImage) return null
  const isEditable = !!editor?.isEditable

  return (
    <Popover
      open={resizePopoverOpen}
      onOpenChange={(open) => {
        if (!isResizingRef.current || open) {
          setResizePopoverOpen(open)
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-muted"
              data-resize-control
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setResizePopoverOpen(true)}
              disabled={!isEditable}
            >
              <ImageDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Image Resize</TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80" data-resize-control>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="width">Width ({selectedImage.width}px)</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  data-resize-control
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onMaximize}
                  title="Maximize to container width"
                  disabled={!isEditable}
                >
                  <Maximize className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  data-resize-control
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onReset}
                  title="Reset to original size"
                  disabled={!isEditable}
                >
                  <Minimize className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Slider
              id="width"
              min={50}
              max={1500}
              step={1}
              value={[selectedImage.width]}
              onValueChange={onWidthChange}
              onMouseDown={onSliderMouseDown}
              onMouseUp={onSliderMouseUp}
              disabled={!isEditable}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height ({selectedImage.height}px)</Label>
            <Slider
              id="height"
              min={50}
              max={1500}
              step={1}
              value={[selectedImage.height]}
              onValueChange={onHeightChange}
              onMouseDown={onSliderMouseDown}
              onMouseUp={onSliderMouseUp}
              disabled={!isEditable}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="aspect-ratio"
              checked={maintainAspectRatio}
              onCheckedChange={onToggleAspectRatio}
              disabled={!isEditable}
            />
            <Label htmlFor="aspect-ratio" className="flex items-center cursor-pointer">
              {maintainAspectRatio ? (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Maintain aspect ratio
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3 mr-1" />
                  Free resize
                </>
              )}
            </Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
