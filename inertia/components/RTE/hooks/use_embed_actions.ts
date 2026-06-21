import type { Editor } from '@tiptap/react'
import { NodeSelection } from 'prosemirror-state'
import { useCallback, useEffect, useState } from 'react'
import { api } from '~/lib/axios'
import { urlFor } from '~/lib/client'

type LinkMetadata = {
  url: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  siteName?: string | null
}

type YoutubeMetadata = {
  url: string
  videoId: string
  title?: string | null
  thumbnailUrl?: string | null
}

const normalizeLinkUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('#')) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const isAnchorLink = (value: string) => value.startsWith('#')
const getLinkAttrs = (url: string) =>
  isAnchorLink(url)
    ? {
        href: url,
        target: null,
        rel: null,
      }
    : {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      }

const extractYoutubeVideoId = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export default function useEmbedActions(editor: Editor | null) {
  const [linkUrl, setLinkUrl] = useState('')
  const [isFetchingLinkMetadata, setIsFetchingLinkMetadata] = useState(false)
  const [linkMetadata, setLinkMetadata] = useState<LinkMetadata | null>(null)
  const [linkMetadataError, setLinkMetadataError] = useState<string | null>(null)

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isFetchingYoutubeMetadata, setIsFetchingYoutubeMetadata] = useState(false)
  const [youtubeMetadata, setYoutubeMetadata] = useState<YoutubeMetadata | null>(null)
  const [youtubeMetadataError, setYoutubeMetadataError] = useState<string | null>(null)

  const setLink = useCallback(() => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeLinkUrl(linkUrl)
    if (!normalizedUrl) return

    const selection = editor.state.selection
    const hasTextSelection = !selection.empty && !(selection instanceof NodeSelection)
    const linkAttrs = getLinkAttrs(normalizedUrl)

    if (hasTextSelection) {
      editor.chain().focus().extendMarkRange('link').setLink(linkAttrs).run()
    } else if (isAnchorLink(normalizedUrl)) {
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            text: normalizedUrl,
            marks: [
              {
                type: 'link',
                attrs: linkAttrs,
              },
            ],
          },
          { type: 'paragraph' },
        ])
        .run()
    } else {
      const isMetadataForCurrentUrl = linkMetadata?.url === normalizedUrl
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'linkCard',
            attrs: {
              url: normalizedUrl,
              title: isMetadataForCurrentUrl ? linkMetadata?.title || null : null,
              description: isMetadataForCurrentUrl ? linkMetadata?.description || null : null,
              imageUrl: isMetadataForCurrentUrl ? linkMetadata?.imageUrl || null : null,
              siteName: isMetadataForCurrentUrl ? linkMetadata?.siteName || null : null,
              size: 'md',
              position: 'center',
            },
          },
          { type: 'paragraph' },
        ])
        .run()
    }

    setLinkUrl('')
    setLinkMetadata(null)
    setLinkMetadataError(null)
  }, [editor, linkUrl, linkMetadata])

  const fetchLinkMetadata = useCallback(async () => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeLinkUrl(linkUrl)
    if (!normalizedUrl) return
    if (isAnchorLink(normalizedUrl)) {
      setLinkMetadata(null)
      setLinkMetadataError('Anchor links do not use metadata preview')
      return
    }

    setIsFetchingLinkMetadata(true)
    setLinkMetadataError(null)
    try {
      const response = await api.get(urlFor('api.v1.utils.link-metadata'), {
        params: { url: normalizedUrl },
      })
      const data = response.data?.data

      setLinkMetadata({
        url: normalizedUrl,
        title: typeof data?.title === 'string' ? data.title : null,
        description: typeof data?.description === 'string' ? data.description : null,
        imageUrl: typeof data?.imageUrl === 'string' ? data.imageUrl : null,
        siteName: typeof data?.siteName === 'string' ? data.siteName : null,
      })
    } catch (err) {
      setLinkMetadata({
        url: normalizedUrl,
        title: null,
        description: null,
        imageUrl: null,
        siteName: null,
      })
      setLinkMetadataError(err instanceof Error ? err.message : 'Failed to fetch metadata')
    } finally {
      setIsFetchingLinkMetadata(false)
    }
  }, [editor, linkUrl])

  const fetchYoutubeMetadata = useCallback(async () => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeLinkUrl(youtubeUrl)
    const videoId = extractYoutubeVideoId(normalizedUrl)
    if (!normalizedUrl || !videoId) {
      setYoutubeMetadataError('Invalid YouTube URL')
      return
    }

    setIsFetchingYoutubeMetadata(true)
    setYoutubeMetadataError(null)
    try {
      const { data } = await api.get('https://noembed.com/embed', {
        params: { url: normalizedUrl },
      })
      setYoutubeMetadata({
        url: normalizedUrl,
        videoId,
        title: typeof data?.title === 'string' ? data.title : null,
        thumbnailUrl:
          typeof data?.thumbnail_url === 'string'
            ? data.thumbnail_url
            : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      })
    } catch (err) {
      setYoutubeMetadata({
        url: normalizedUrl,
        videoId,
        title: null,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      })
      setYoutubeMetadataError(
        err instanceof Error ? err.message : 'Failed to fetch YouTube metadata'
      )
    } finally {
      setIsFetchingYoutubeMetadata(false)
    }
  }, [editor, youtubeUrl])

  const addYoutubeEmbed = useCallback(() => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeLinkUrl(youtubeUrl)
    const videoId = extractYoutubeVideoId(normalizedUrl)
    if (!normalizedUrl || !videoId) {
      setYoutubeMetadataError('Invalid YouTube URL')
      return
    }

    const isMetadataForCurrentUrl = youtubeMetadata?.url === normalizedUrl
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'youtubeEmbed',
          attrs: {
            url: normalizedUrl,
            videoId,
            title: isMetadataForCurrentUrl ? youtubeMetadata?.title || null : null,
            thumbnailUrl: isMetadataForCurrentUrl ? youtubeMetadata?.thumbnailUrl || null : null,
            size: 'md',
            position: 'center',
            aspectRatio: '16/9',
            startAt: 0,
          },
        },
        { type: 'paragraph' },
      ])
      .run()

    setYoutubeUrl('')
    setYoutubeMetadata(null)
    setYoutubeMetadataError(null)
  }, [editor, youtubeUrl, youtubeMetadata])

  useEffect(() => {
    if (!linkUrl.trim()) {
      setLinkMetadata(null)
      setLinkMetadataError(null)
      return
    }

    const normalized = normalizeLinkUrl(linkUrl)
    if (linkMetadata?.url && linkMetadata.url !== normalized) {
      setLinkMetadata(null)
      setLinkMetadataError(null)
    }
  }, [linkUrl, linkMetadata?.url])

  useEffect(() => {
    if (!youtubeUrl.trim()) {
      setYoutubeMetadata(null)
      setYoutubeMetadataError(null)
      return
    }

    const normalized = normalizeLinkUrl(youtubeUrl)
    if (youtubeMetadata?.url && youtubeMetadata.url !== normalized) {
      setYoutubeMetadata(null)
      setYoutubeMetadataError(null)
    }
  }, [youtubeUrl, youtubeMetadata?.url])

  return {
    linkUrl,
    setLinkUrl,
    isFetchingLinkMetadata,
    linkMetadata,
    linkMetadataError,
    setLink,
    fetchLinkMetadata,

    youtubeUrl,
    setYoutubeUrl,
    isFetchingYoutubeMetadata,
    youtubeMetadata,
    youtubeMetadataError,
    fetchYoutubeMetadata,
    addYoutubeEmbed,
  }
}
