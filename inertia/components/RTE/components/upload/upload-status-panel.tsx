import { File, ImageIcon, Loader2, Music2, Video } from 'lucide-react'
import { Progress } from '~/components/ui/progress'
import { cn } from '~/lib/utils'

type UploadTaskType = 'image' | 'file' | 'audio' | 'video'

export type UploadTask = {
  id: UploadTaskType
  progress: number
}

const TASK_META: Record<UploadTaskType, { Icon: typeof ImageIcon; progressLabel: string }> = {
  image: {
    Icon: ImageIcon,
    progressLabel: 'Uploading image',
  },
  file: {
    Icon: File,
    progressLabel: 'Uploading file',
  },
  audio: {
    Icon: Music2,
    progressLabel: 'Uploading audio',
  },
  video: {
    Icon: Video,
    progressLabel: 'Uploading video',
  },
}

export default function UploadStatusPanel({ tasks }: { tasks: UploadTask[] }) {
  if (tasks.length === 0) return null

  return (
    <div className="pointer-events-none fixed top-25 right-3 z-40 w-[18rem] space-y-2">
      {tasks.map((task) => {
        const meta = TASK_META[task.id]
        const progress = Math.min(100, Math.max(0, task.progress || 0))

        return (
          <div
            key={task.id}
            className={cn(
              'rounded-base border-2 border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm'
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <meta.Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-heading">{meta.progressLabel}</span>
              </div>
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
            </div>
            <Progress value={progress} className="h-1.5 w-full" />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {progress > 0 ? `${progress}%` : 'Preparing...'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
