import { Box, Center, Image, ImageFactory, Loader, Styles } from '@mantine/core'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'

interface ImageWithLoaderProps {
  src: string
  alt?: string
  height?: number | string
  width?: number | string
  radius?: number | string
  className?: string // Added optional className parameter
  styles?: Styles<ImageFactory> // Added optional styles parameter
  fallbackSrc?: string
  [key: string]: any
}

function ImageWithLoader({
  src,
  alt,
  width,
  height = 100,
  radius = 'xs',
  className,
  styles,
  fallbackSrc,
  ...props
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [_error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true)
    setError(false)
    setImageSrc(src)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
    if (fallbackSrc) {
      setImageSrc(fallbackSrc)
    } else {
      setImageSrc('/util/not-found.png')
    }
  }

  const toCssSize = (value: number | string | undefined) =>
    typeof value === 'number' ? `${value}px` : value

  const explicitWidth = toCssSize(width)
  const explicitHeight = toCssSize(height)
  const imageStyle = (props.style || {}) as CSSProperties

  return (
    <Box
      style={{
        position: 'relative',
        width: explicitWidth || undefined,
        maxWidth: '100%',
        height: isLoading ? explicitHeight : explicitHeight || 'auto',
        overflow: 'hidden',
      }}
      className={className}
    >
      {isLoading && (
        <>
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(240, 240, 240, 0.6)',
              backdropFilter: `blur(7px)`,
              WebkitBackdropFilter: `blur(7px)`,
              zIndex: 2,
            }}
          />
          <Center
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 3,
            }}
          >
            <Loader />
          </Center>
        </>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        radius={radius}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          visibility: isLoading ? 'hidden' : 'visible',
          display: 'block',
          width: explicitWidth || undefined,
          maxWidth: '100%',
          height: explicitHeight || undefined,
          ...imageStyle,
        }}
        m={0}
        styles={styles}
        {...props}
      />
    </Box>
  )
}

export default ImageWithLoader
