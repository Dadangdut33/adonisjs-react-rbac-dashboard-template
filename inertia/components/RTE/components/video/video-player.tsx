import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const remaining = total % 60
  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

export default function VideoPlayer({
  src,
  mimeType,
  className,
}: {
  src: string
  mimeType?: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0)
    const handleLoadedMetadata = () => setDuration(video.duration || 0)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('durationchange', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('durationchange', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [src])

  const progressPercent = useMemo(() => {
    if (!duration) return 0
    return Math.min(100, Math.max(0, (currentTime / duration) * 100))
  }, [currentTime, duration])

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      try {
        await video.play()
      } catch {
        setIsPlaying(false)
      }
      return
    }
    video.pause()
  }

  const handleSeek = (next: number) => {
    const video = videoRef.current
    if (!video || !duration) return
    const clamped = Math.max(0, Math.min(duration, next))
    video.currentTime = clamped
    setCurrentTime(clamped)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  const handleVolume = (next: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, next))
    video.volume = clamped
    if (clamped > 0 && video.muted) video.muted = false
  }

  const enterFullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await el.requestFullscreen()
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden rounded-base border-2 border-border bg-secondary-background', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <video ref={videoRef} className="aspect-video w-full bg-black" preload="metadata">
        <source src={src} type={mimeType || 'video/mp4'} />
      </video>

      <div className="space-y-2 p-3">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            step={0.01}
            onChange={(e) => handleSeek(Number.parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full border-2 border-border bg-background"
            style={{
              background: `linear-gradient(to right, var(--main) ${progressPercent}%, var(--background) ${progressPercent}%)`,
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="w-24 text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolume(Number.parseFloat(e.target.value))}
              className="h-2 w-24 cursor-pointer appearance-none rounded-full border-2 border-border bg-background"
            />
          </div>

          <div className="ml-auto">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={enterFullscreen}
              aria-label="Toggle fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
