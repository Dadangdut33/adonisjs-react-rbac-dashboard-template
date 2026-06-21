import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
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

export default function AudioPlayer({
  src,
  mimeType,
  className,
}: {
  src: string
  mimeType?: string
  className?: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    const handleLoadedMetadata = () => setDuration(audio.duration || 0)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(audio.volume)
      setIsMuted(audio.muted)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('durationchange', handleLoadedMetadata)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('volumechange', handleVolumeChange)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('durationchange', handleLoadedMetadata)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [src])

  const progressPercent = useMemo(() => {
    if (!duration) return 0
    return Math.min(100, Math.max(0, (currentTime / duration) * 100))
  }, [currentTime, duration])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setIsPlaying(false)
      }
      return
    }

    audio.pause()
  }

  const handleSeek = (next: number) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const clamped = Math.max(0, Math.min(duration, next))
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
  }

  const handleVolume = (next: number) => {
    const audio = audioRef.current
    if (!audio) return
    const clamped = Math.max(0, Math.min(1, next))
    audio.volume = clamped
    if (clamped > 0 && audio.muted) audio.muted = false
  }

  return (
    <div
      className={cn('rounded-base border-2 border-border bg-secondary-background p-3', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <audio ref={audioRef} preload="metadata">
        <source src={src} type={mimeType || 'audio/mpeg'} />
      </audio>

      <div className="flex items-center gap-2">
        <div className="flex flex-col min-w-0 flex-1 space-y-2">
          <div className="min-w-0 flex-1">
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
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className=" items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
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
          </div>
        </div>
      </div>
    </div>
  )
}
