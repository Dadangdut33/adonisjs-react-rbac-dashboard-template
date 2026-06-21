import { Editor } from '@tiptap/core'
import { ImageIcon, Upload } from 'lucide-react'
import type { ChangeEvent, RefObject } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

export default function ImageDialogButton({
  editor,
  imageUrl,
  setImageUrl,
  onAddImage,
  onOpenLibrary,
  isUploading,
  uploadProgress,
  fileInputRef,
  onFileInputChange,
}: {
  editor: Editor | null
  imageUrl: string
  setImageUrl: (value: string) => void
  onAddImage: () => void
  onOpenLibrary: () => void
  isUploading: boolean
  uploadProgress: number
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  if (!editor) return null
  const isEditable = !!editor?.isEditable
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!isEditable}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Image</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Upload Image</Label>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors',
                    isUploading && 'pointer-events-none opacity-70'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                      </div>
                      <p className="text-sm text-muted-foreground">Uploading image...</p>
                      <Progress value={uploadProgress} className="h-2 w-full" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Drag and drop an image, or click to browse
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Max file size: 10MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileInputChange}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button onClick={onAddImage} disabled={!imageUrl}>
                    Add Image
                  </Button>
                </DialogClose>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="py-4">
            <div className="grid gap-4">
              <Button onClick={onOpenLibrary}>Open Media Library</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
