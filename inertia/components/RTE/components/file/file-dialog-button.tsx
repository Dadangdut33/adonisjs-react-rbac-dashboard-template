import { Editor } from '@tiptap/core'
import { FileUp, Upload } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent, DragEvent, RefObject } from 'react'
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

const ACCEPT_FILES =
  '.zip,.rar,.7z,.tar,.gz,.bz2,.xz,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.csv,.txt'

export default function FileDialogButton({
  editor,
  isUploadingFile,
  fileUploadProgress,
  fileInputRef,
  onFileInputChange,
  onFileDrop,
  onInsertFromUrl,
  onOpenLibrary,
}: {
  editor: Editor | null
  isUploadingFile: boolean
  fileUploadProgress: number
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  onFileDrop: (file: File) => void
  onInsertFromUrl: (url: string) => void
  onOpenLibrary: () => void
}) {
  if (!editor) return null
  const isEditable = !!editor.isEditable
  const [fileUrl, setFileUrl] = useState('')

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!isEditable}>
              <FileUp className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add File</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="py-4">
            <div className="grid gap-2">
              <Label>Upload File</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors',
                  isUploadingFile && 'pointer-events-none opacity-70'
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault()
                  const files = e.dataTransfer.files
                  if (files && files.length > 0) {
                    onFileDrop(files[0])
                  }
                }}
              >
                {isUploadingFile ? (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground">Uploading file...</p>
                    <Progress value={fileUploadProgress} className="h-2 w-full" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop a file, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Accepted: PDF, Office docs, archives (max 50MB)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_FILES}
                  className="hidden"
                  onChange={onFileInputChange}
                  disabled={isUploadingFile || !isEditable}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fileUrl">File URL</Label>
                <Input
                  id="fileUrl"
                  placeholder="https://example.com/file.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  disabled={!isEditable}
                />
              </div>
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button
                    onClick={() => {
                      onInsertFromUrl(fileUrl)
                      setFileUrl('')
                    }}
                    disabled={!fileUrl.trim()}
                  >
                    Add File
                  </Button>
                </DialogClose>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="py-4">
            <div className="grid gap-4">
              <Button onClick={onOpenLibrary} disabled={!isEditable}>
                Open Media Library
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
